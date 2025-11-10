from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Organization
from .serializers import (
    OrganizationSerializer,
    OrganizationCreateSerializer,
    OrganizationUpdateSerializer
)


class OrganizationViewSet(viewsets.ModelViewSet):
    """ViewSet for Organization model."""
    
    queryset = Organization.objects.all()
    serializer_class = OrganizationSerializer
    permission_classes = [IsAuthenticated]
    lookup_field = 'slug'
    
    def get_queryset(self):
        """Filter organizations based on user permissions."""
        user = self.request.user
        if user.is_superuser:
            return Organization.objects.all()
        return Organization.objects.filter(id=user.organization_id)
    
    def get_serializer_class(self):
        """Return appropriate serializer based on action."""
        if self.action == 'create':
            return OrganizationCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return OrganizationUpdateSerializer
        return OrganizationSerializer
    
    @action(detail=False, methods=['get'])
    def my_organization(self, request):
        """Get current user's organization."""
        if not request.user.organization:
            return Response(
                {'error': 'Usuário não está associado a nenhuma organização.'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        serializer = self.get_serializer(request.user.organization)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def usage(self, request, slug=None):
        """Get organization usage statistics."""
        organization = self.get_object()
        
        usage_data = {
            'users': {
                'current': organization.get_user_count(),
                'limit': organization.max_users,
                'percentage': (organization.get_user_count() / organization.max_users * 100) if organization.max_users > 0 else 0
            },
            'dashboards': {
                'current': organization.get_dashboard_count(),
                'limit': organization.max_dashboards,
                'percentage': (organization.get_dashboard_count() / organization.max_dashboards * 100) if organization.max_dashboards > 0 else 0
            },
            'datasources': {
                'current': organization.get_datasource_count(),
                'limit': organization.max_datasources,
                'percentage': (organization.get_datasource_count() / organization.max_datasources * 100) if organization.max_datasources > 0 else 0
            },
        }
        
        return Response(usage_data)
