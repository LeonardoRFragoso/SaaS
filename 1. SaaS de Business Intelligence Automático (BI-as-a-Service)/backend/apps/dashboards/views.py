from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Dashboard
from .serializers import DashboardSerializer
from .services import DashboardService


class DashboardViewSet(viewsets.ModelViewSet):
    serializer_class = DashboardSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Dashboard.objects.filter(organization=self.request.user.organization)

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
            data = service.get_dashboard_data(dashboard)
            
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
        
        if not new_template:
            return Response({'error': 'Template não fornecido'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            service = DashboardService()
            dashboard = service.change_template(dashboard, new_template)
            
            serializer = self.get_serializer(dashboard)
            return Response(serializer.data)
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
