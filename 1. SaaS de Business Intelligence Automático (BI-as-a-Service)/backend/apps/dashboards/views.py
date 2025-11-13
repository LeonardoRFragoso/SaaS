from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .models import Dashboard
from django.db.models import Count
from django.db.utils import OperationalError, ProgrammingError
from .serializers import DashboardSerializer
from .services import DashboardService
from django.utils import timezone
import secrets


class DashboardViewSet(viewsets.ModelViewSet):
    serializer_class = DashboardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # Oculta dashboards de pré-visualização na listagem por padrão
        qs = Dashboard.objects.filter(organization=self.request.user.organization)
        include_preview = self.request.query_params.get('include_preview') == '1'
        if not include_preview:
            try:
                qs = qs.filter(is_preview=False)
            except (OperationalError, ProgrammingError):
                # Coluna ainda não existe (migration não aplicada) → não filtrar para não quebrar
                pass
        return qs
    
    def get_object(self):
        """
        Permite recuperar dashboards de pré-visualização pela rota direta,
        mesmo que a listagem os oculte.
        """
        pk = self.kwargs.get(self.lookup_field or 'pk')
        return Dashboard.objects.get(pk=pk, organization=self.request.user.organization)

    def list(self, request, *args, **kwargs):
        """
        Lista dashboards com fallback seguro caso ocorra algum erro inesperado.
        Evita quebrar a UI na listagem.
        """
        try:
            return super().list(request, *args, **kwargs)
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error listing dashboards: {str(e)}")
            # Fallback em formato similar à paginação DRF
            return Response({
                'count': 0,
                'next': None,
                'previous': None,
                'results': [],
                'error': str(e),
            })

    def perform_create(self, serializer):
        serializer.save(
            organization=self.request.user.organization,
            created_by=self.request.user
        )
    
    def retrieve(self, request, *args, **kwargs):
        """Retornar dashboard com dados processados"""
        dashboard = self.get_object()
        serializer = self.get_serializer(dashboard)
        
        # Processar dados do dashboard
        try:
            service = DashboardService()
            processed_data = service.get_dashboard_data(dashboard)
            
            # Combinar dados do dashboard com dados processados
            response_data = serializer.data
            response_data['processed_data'] = processed_data
            response_data['config'] = dashboard.config
            
            return Response(response_data)
        except Exception as e:
            # Se der erro, retornar dados básicos com erro para debug
            import traceback
            response_data = serializer.data
            response_data['error'] = str(e)
            response_data['traceback'] = traceback.format_exc()
            response_data['processed_data'] = {'kpis': {}, 'charts': {}}
            return Response(response_data)

    @action(detail=True, methods=['get'])
    def data(self, request, pk=None):
        """Obter dados processados do dashboard"""
        dashboard = self.get_object()
        
        try:
            service = DashboardService()
            options = {
                'period': request.query_params.get('period') or '30d',
                'compare': request.query_params.get('compare') in ('1', 'true', 'True'),
            }
            data = service.get_dashboard_data(dashboard, options=options)
            
            return Response(data)
            
        except Exception as e:
            import traceback
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error in dashboard data endpoint: {str(e)}")
            logger.error(traceback.format_exc())
            return Response({
                'error': str(e),
                'traceback': traceback.format_exc()
            }, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def change_template(self, request, pk=None):
        """Trocar template do dashboard"""
        dashboard = self.get_object()
        new_template = request.data.get('template')
        organization = request.user.organization
        
        if not new_template:
            return Response({'error': 'Template não fornecido'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Validar templates permitidos por plano
            plan = getattr(organization, 'plan', 'free')
            allowed_by_plan = {
                'free': {'sales', 'financial'},
                'starter': {'sales', 'financial'},
                'pro': {'sales', 'financial', 'performance', 'custom'},
                'enterprise': {'sales', 'financial', 'performance', 'custom'},
            }
            allowed = allowed_by_plan.get(plan, {'sales', 'financial'})
            if new_template not in allowed:
                return Response({
                    'error': 'Template indisponível no seu plano',
                    'current_plan': plan,
                    'allowed_templates': sorted(list(allowed)),
                    'required_plan': 'pro'  # por padrão, templates extras são Pro+
                }, status=status.HTTP_403_FORBIDDEN)
            
            service = DashboardService()
            dashboard = service.change_template(dashboard, new_template)
            
            serializer = self.get_serializer(dashboard)
            return Response(serializer.data)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def cleanup_orphans(self, request):
        """
        Remove dashboards sem nenhuma fonte de dados (órfãos) da organização atual.
        NÃO remove pré-visualizações.
        """
        org = request.user.organization
        orphans = (
            Dashboard.objects
            .filter(organization=org, is_preview=False)
            .annotate(ds_count=Count('datasources'))
            .filter(ds_count=0)
        )
        deleted = orphans.count()
        orphans.delete()
        return Response({'deleted': deleted})
    
    @action(detail=True, methods=['post'])
    def share_preview(self, request, pk=None):
        """
        Gera link de visualização pública com expiração de 24h.
        """
        dashboard = self.get_object()
        token = secrets.token_urlsafe(24)
        dashboard.public_preview_token = token
        dashboard.public_preview_expires_at = timezone.now() + timezone.timedelta(hours=24)
        dashboard.save(update_fields=['public_preview_token', 'public_preview_expires_at', 'updated_at'])
        return Response({
            'token': token,
            'expires_at': dashboard.public_preview_expires_at.isoformat(),
        })
    
    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def public(self, request):
        """
        Endpoint público para visualizar um dashboard via token de pré-visualização.
        Query params: token=...
        """
        token = request.query_params.get('token', '')
        if not token:
            return Response({'error': 'Token não fornecido'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            dashboard = Dashboard.objects.get(public_preview_token=token)
        except Dashboard.DoesNotExist:
            return Response({'error': 'Token inválido'}, status=status.HTTP_404_NOT_FOUND)
        
        if not dashboard.public_preview_expires_at or dashboard.public_preview_expires_at < timezone.now():
            return Response({'error': 'Link expirado'}, status=status.HTTP_410_GONE)
        
        service = DashboardService()
        data = service.get_dashboard_data(dashboard, options={'period': '30d', 'compare': True})
        data['watermark'] = True
        return Response(data)
    
    @action(detail=True, methods=['post'])
    def set_goal(self, request, pk=None):
        """
        Define uma meta simples no dashboard: metric in ['revenue','avg_ticket'].
        """
        dashboard = self.get_object()
        metric = request.data.get('metric')
        target = request.data.get('target')
        deadline = request.data.get('deadline')
        if metric not in ('revenue', 'avg_ticket'):
            return Response({'error': 'Métrica inválida'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            target_val = float(target)
        except Exception:
            return Response({'error': 'Target inválido'}, status=status.HTTP_400_BAD_REQUEST)
        
        goals = dashboard.config.get('goals', {})
        goals[metric] = {'target': target_val, 'deadline': deadline}
        dashboard.config['goals'] = goals
        dashboard.save(update_fields=['config', 'updated_at'])
        return Response({'ok': True, 'goals': goals})
    
    @action(detail=True, methods=['post'])
    def add_note(self, request, pk=None):
        """
        Adiciona nota a um gráfico: body { chart_key, text }.
        No Free/Starter, 1 nota por gráfico.
        """
        dashboard = self.get_object()
        org = request.user.organization
        chart_key = request.data.get('chart_key')
        text = (request.data.get('text') or '').strip()
        if not chart_key or not text:
            return Response({'error': 'Parâmetros inválidos'}, status=status.HTTP_400_BAD_REQUEST)
        
        notes = dashboard.config.get('notes', {})
        if chart_key in notes and org.plan in ('free', 'starter'):
            return Response({'error': 'Limite de notas para este gráfico no seu plano'}, status=status.HTTP_403_FORBIDDEN)
        
        notes[chart_key] = {'text': text, 'author': request.user.id, 'at': timezone.now().isoformat()}
        dashboard.config['notes'] = notes
        dashboard.save(update_fields=['config', 'updated_at'])
        return Response({'ok': True, 'notes': notes})
    
    @action(detail=True, methods=['post'])
    def ask(self, request, pk=None):
        """
        Responde pergunta simples usando dados atuais, respeitando limite mensal de IA.
        """
        dashboard = self.get_object()
        org = request.user.organization
        question = (request.data.get('question') or '').strip()
        if not question:
            return Response({'error': 'Pergunta não fornecida'}, status=status.HTTP_400_BAD_REQUEST)
        if not org.can_use_ai_insight():
            return Response({'error': 'Limite mensal de IA atingido'}, status=status.HTTP_403_FORBIDDEN)
        
        service = DashboardService()
        answer = service.answer_question(dashboard, question)
        org.increment_ai_usage()
        return Response({'answer': answer, 'remaining': max(0, org.max_ai_insights_per_month - org.ai_insights_used_this_month)})
    
    @action(detail=True, methods=['post'])
    def preview_mapping(self, request, pk=None):
        """
        Pré-visualiza efeito de um mapeamento de colunas sem salvar.
        body: { mapping: { value?, date?, product?, quantity? }, period?, compare? }
        """
        dashboard = self.get_object()
        mapping = request.data.get('mapping') or {}
        options = {
            'period': request.data.get('period') or '30d',
            'compare': bool(request.data.get('compare')),
            'override_mapping': mapping,
        }
        try:
            service = DashboardService()
            data = service.get_dashboard_data(dashboard, options=options)
            return Response(data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
