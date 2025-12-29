"""
DataSource REST API views
"""
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from apps.datasources.models import DataSource
from apps.datasources.serializers import DataSourceSerializer
from apps.datasources.services.data_ingestion_service import DataIngestionService
from apps.datasources.tasks import sync_datasource
import pandas as pd
import numpy as np
import logging

logger = logging.getLogger(__name__)


class DataSourceViewSet(viewsets.ModelViewSet):
    """
    ViewSet for DataSource CRUD operations
    """
    serializer_class = DataSourceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter by organization"""
        return DataSource.objects.filter(
            organization=self.request.user.organization
        ).order_by('-created_at')
    
    def perform_create(self, serializer):
        """Set organization and created_by"""
        serializer.save(
            organization=self.request.user.organization,
            created_by=self.request.user
        )
    
    @action(detail=True, methods=['post'])
    def sync(self, request, pk=None):
        """
        Trigger manual sync for a datasource
        
        POST /api/datasources/{id}/sync/
        """
        datasource = self.get_object()
        
        # Check if organization can sync
        if not datasource.organization.subscription_active:
            return Response(
                {'error': 'Subscription inactive'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Trigger async sync
        sync_datasource.delay(datasource.id)
        
        return Response({
            'message': 'Sync started',
            'datasource_id': datasource.id
        })
    
    @action(detail=True, methods=['get'])
    def status(self, request, pk=None):
        """
        Get sync status and metadata
        
        GET /api/datasources/{id}/status/
        """
        datasource = self.get_object()
        
        # Get snapshot metadata
        ingestion_service = DataIngestionService()
        snapshot = ingestion_service.get_snapshot(datasource)
        
        response_data = {
            'id': datasource.id,
            'name': datasource.name,
            'source_type': datasource.source_type,
            'is_active': datasource.is_active,
            'auto_sync': datasource.auto_sync,
            'last_synced_at': datasource.last_synced_at,
            'row_count': datasource.row_count,
            'created_at': datasource.created_at,
        }
        
        if snapshot:
            response_data['snapshot'] = {
                'timestamp': snapshot.get('timestamp'),
                'row_count': snapshot.get('row_count'),
                'column_count': snapshot.get('column_count'),
                'data_hash': snapshot.get('data_hash'),
                'statistics': snapshot.get('statistics')
            }
        
        return Response(response_data)
    
    @action(detail=True, methods=['get'])
    def preview(self, request, pk=None):
        """
        Get preview of datasource data
        
        GET /api/datasources/{id}/preview/?limit=100
        """
        datasource = self.get_object()
        
        try:
            ingestion_service = DataIngestionService()
            snapshot = ingestion_service.get_snapshot(datasource)
            
            if not snapshot:
                return Response(
                    {'error': 'No data available. Sync first.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get limit from query params
            limit = int(request.query_params.get('limit', 100))
            limit = min(limit, 1000)  # Max 1000 rows
            
            sample_data = snapshot.get('sample_data', [])[:limit]
            
            return Response({
                'datasource_id': datasource.id,
                'name': datasource.name,
                'total_rows': snapshot.get('row_count'),
                'total_columns': snapshot.get('column_count'),
                'schema': snapshot.get('schema'),
                'data': sample_data,
                'preview_rows': len(sample_data)
            })
            
        except Exception as e:
            logger.error(f"Error getting preview for datasource {datasource.id}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def _clean_data_for_json(self, data):
        """Clean data by replacing NaN/Infinity with None"""
        if isinstance(data, dict):
            return {key: self._clean_data_for_json(value) for key, value in data.items()}
        elif isinstance(data, list):
            return [self._clean_data_for_json(item) for item in data]
        elif isinstance(data, float):
            if np.isnan(data) or np.isinf(data):
                return None
            return data
        elif pd.isna(data):
            return None
        return data
    
    @action(detail=True, methods=['get'])
    def data(self, request, pk=None):
        """
        Get datasource data with pagination
        
        GET /api/datasources/{id}/data/?limit=100&offset=0
        """
        datasource = self.get_object()
        
        try:
            ingestion_service = DataIngestionService()
            snapshot = ingestion_service.get_snapshot(datasource)
            
            if not snapshot:
                return Response(
                    {'error': 'Não foi possível carregar os dados desta fonte agora.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            # Get pagination params
            limit = int(request.query_params.get('limit', 100))
            offset = int(request.query_params.get('offset', 0))
            limit = min(limit, 1000)  # Max 1000 rows per request
            
            # Get data from snapshot
            full_data = snapshot.get('full_data', snapshot.get('sample_data', []))
            total_rows = len(full_data)
            
            # Apply pagination
            paginated_data = full_data[offset:offset + limit]
            
            # Clean data for JSON serialization
            clean_data = self._clean_data_for_json(paginated_data)
            
            # Extract columns from schema or first row
            schema = snapshot.get('schema', {})
            columns = list(schema.keys()) if schema else (list(clean_data[0].keys()) if clean_data else [])
            
            return Response({
                'columns': columns,
                'rows': clean_data,
                'total_rows': total_rows
            })
            
        except Exception as e:
            logger.error(f"Error getting data for datasource {datasource.id}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def schema(self, request, pk=None):
        """
        Get schema information
        
        GET /api/datasources/{id}/schema/
        """
        datasource = self.get_object()
        
        try:
            ingestion_service = DataIngestionService()
            snapshot = ingestion_service.get_snapshot(datasource)
            
            if not snapshot:
                return Response(
                    {'error': 'No data available. Sync first.'},
                    status=status.HTTP_404_NOT_FOUND
                )
            
            return Response({
                'datasource_id': datasource.id,
                'name': datasource.name,
                'schema': snapshot.get('schema'),
                'statistics': snapshot.get('statistics')
            })
            
        except Exception as e:
            logger.error(f"Error getting schema for datasource {datasource.id}: {str(e)}")
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=False, methods=['post'])
    def upload_csv(self, request):
        """
        Upload CSV file, create datasource, and auto-generate dashboard with AI analysis
        
        POST /api/datasources/upload_csv/
        """
        file = request.FILES.get('file')
        name = request.data.get('name')
        
        if not file:
            return Response({'error': 'Arquivo não fornecido'}, status=status.HTTP_400_BAD_REQUEST)
        
        if not name:
            return Response({'error': 'Nome não fornecido'}, status=status.HTTP_400_BAD_REQUEST)
        
        organization = request.user.organization
        
        # Check datasource limit
        if hasattr(organization, 'can_add_datasource') and not organization.can_add_datasource():
            return Response({
                'error': 'Limite de fontes de dados atingido',
            }, status=status.HTTP_403_FORBIDDEN)
        
        try:
            # Read CSV
            df = pd.read_csv(file)
            
            # Create datasource
            datasource = DataSource.objects.create(
                organization=organization,
                created_by=request.user,
                name=name,
                source_type='csv_upload',
                is_active=True,
                row_count=0
            )
            
            # Ingest data using the service
            ingestion_service = DataIngestionService()
            ingestion_service.ingest_dataframe(datasource, df)
            
            logger.info(f"CSV datasource created and ingested: {datasource.id}")
            
            # AUTO-CREATE DASHBOARD WITH AI ANALYSIS
            try:
                from apps.dashboards.services.auto_dashboard_service import AutoDashboardService
                
                auto_dashboard_service = AutoDashboardService()
                dashboard_info = auto_dashboard_service.create_dashboard_from_datasource(
                    datasource=datasource,
                    user=request.user,
                    organization=organization
                )
                
                logger.info(f"Dashboard auto-created: {dashboard_info}")
                
                # Return datasource + dashboard info
                serializer = self.get_serializer(datasource)
                response_data = serializer.data
                response_data.update(dashboard_info)
                
                return Response(response_data, status=status.HTTP_201_CREATED)
                
            except Exception as dashboard_error:
                logger.error(f"Error auto-creating dashboard: {str(dashboard_error)}", exc_info=True)
                
                # Se falhar na criação do dashboard, ainda retorna a datasource criada
                serializer = self.get_serializer(datasource)
                response_data = serializer.data
                response_data['dashboard_created'] = False
                response_data['dashboard_error'] = str(dashboard_error)
                
                return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            logger.error(f"Error uploading CSV: {str(e)}")
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
