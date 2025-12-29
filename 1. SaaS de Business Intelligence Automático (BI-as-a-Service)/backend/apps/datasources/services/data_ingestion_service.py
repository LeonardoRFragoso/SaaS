"""
Data ingestion and persistence service
Handles data normalization, validation, and storage
"""
import pandas as pd
import numpy as np
import json
from datetime import datetime
from django.utils import timezone
from django.core.cache import cache
import hashlib
import logging

logger = logging.getLogger(__name__)


class DataIngestionService:
    """Service for ingesting and persisting data from external sources"""
    
    def __init__(self):
        self.max_rows = 100000  # Safety limit
    
    def ingest_dataframe(self, datasource, df: pd.DataFrame):
        """
        Ingest a DataFrame and persist it
        
        Steps:
        1. Validate DataFrame
        2. Normalize columns
        3. Generate snapshot
        4. Persist to cache and/or database
        5. Update datasource metadata
        """
        try:
            # Validate
            if df.empty:
                raise ValueError("DataFrame is empty")
            
            if len(df) > self.max_rows:
                logger.warning(f"DataFrame has {len(df)} rows, truncating to {self.max_rows}")
                df = df.head(self.max_rows)
            
            # Normalize
            df_normalized = self.normalize_dataframe(df)
            
            # Generate snapshot
            snapshot = self.create_snapshot(datasource, df_normalized)
            
            # Persist
            self.persist_snapshot(datasource, snapshot)
            
            # Update datasource metadata
            datasource.row_count = len(df_normalized)
            datasource.last_synced_at = timezone.now()
            datasource.save(update_fields=['row_count', 'last_synced_at', 'updated_at'])
            
            logger.info(f"Successfully ingested {len(df_normalized)} rows for datasource {datasource.id}")
            
            return snapshot
            
        except Exception as e:
            logger.error(f"Error ingesting data for datasource {datasource.id}: {str(e)}")
            raise
    
    def normalize_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Normalize DataFrame:
        - Clean column names
        - Handle missing values
        - Infer types
        - Remove duplicates
        """
        df_clean = df.copy()
        
        # Clean column names
        df_clean.columns = [
            str(col).strip().lower().replace(' ', '_').replace('-', '_')
            for col in df_clean.columns
        ]
        
        # Remove completely empty rows
        df_clean = df_clean.dropna(how='all')
        
        # Remove duplicate rows
        df_clean = df_clean.drop_duplicates()
        
        # Infer and convert types
        df_clean = self._infer_types(df_clean)
        
        return df_clean
    
    def _infer_types(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Infer and convert column types intelligently
        """
        df_typed = df.copy()
        
        for col in df_typed.columns:
            # Skip if already datetime
            if pd.api.types.is_datetime64_any_dtype(df_typed[col]):
                continue
            
            # Try to convert to numeric
            try:
                # Remove common currency symbols and thousands separators
                if df_typed[col].dtype == 'object':
                    cleaned = df_typed[col].astype(str).str.replace(r'[R$\s,]', '', regex=True)
                    numeric_col = pd.to_numeric(cleaned, errors='coerce')
                    
                    # If more than 50% converted successfully, use numeric
                    if numeric_col.notna().sum() / len(df_typed) > 0.5:
                        df_typed[col] = numeric_col
                        continue
            except:
                pass
            
            # Try to convert to datetime
            try:
                if df_typed[col].dtype == 'object':
                    date_col = pd.to_datetime(df_typed[col], errors='coerce')
                    
                    # If more than 50% converted successfully, use datetime
                    if date_col.notna().sum() / len(df_typed) > 0.5:
                        df_typed[col] = date_col
                        continue
            except:
                pass
        
        return df_typed
    
    def create_snapshot(self, datasource, df: pd.DataFrame):
        """
        Create a snapshot of the data
        
        Returns dict with:
        - metadata
        - schema
        - sample_data
        - full_data (serialized)
        """
        # Generate data hash for change detection
        data_hash = hashlib.md5(
            df.to_json(date_format='iso').encode()
        ).hexdigest()
        
        # Extract schema
        schema = {
            col: {
                'dtype': str(df[col].dtype),
                'nullable': bool(df[col].isnull().any()),
                'unique_count': int(df[col].nunique()),
                'sample_values': df[col].dropna().head(5).tolist()
            }
            for col in df.columns
        }
        
        # Create snapshot
        snapshot = {
            'datasource_id': datasource.id,
            'timestamp': timezone.now().isoformat(),
            'row_count': len(df),
            'column_count': len(df.columns),
            'data_hash': data_hash,
            'schema': schema,
            'sample_data': df.head(100).to_dict(orient='records'),  # First 100 rows
            'full_data': df.to_dict(orient='records'),  # Full data for processing
            'statistics': self._calculate_statistics(df)
        }
        
        return snapshot
    
    def _calculate_statistics(self, df: pd.DataFrame):
        """Calculate basic statistics for the dataset"""
        stats = {
            'total_rows': len(df),
            'total_columns': len(df.columns),
            'memory_usage_mb': df.memory_usage(deep=True).sum() / (1024 * 1024),
            'numeric_columns': [],
            'date_columns': [],
            'text_columns': []
        }
        
        for col in df.columns:
            if pd.api.types.is_numeric_dtype(df[col]):
                stats['numeric_columns'].append({
                    'name': col,
                    'min': float(df[col].min()) if df[col].notna().any() else None,
                    'max': float(df[col].max()) if df[col].notna().any() else None,
                    'mean': float(df[col].mean()) if df[col].notna().any() else None,
                    'median': float(df[col].median()) if df[col].notna().any() else None
                })
            elif pd.api.types.is_datetime64_any_dtype(df[col]):
                stats['date_columns'].append({
                    'name': col,
                    'min': df[col].min().isoformat() if df[col].notna().any() else None,
                    'max': df[col].max().isoformat() if df[col].notna().any() else None
                })
            else:
                stats['text_columns'].append(col)
        
        return stats
    
    def _clean_for_json(self, obj):
        """
        Recursively convert NaN, Infinity, Timestamp to JSON-serializable types
        """
        if isinstance(obj, dict):
            return {key: self._clean_for_json(value) for key, value in obj.items()}
        elif isinstance(obj, list):
            return [self._clean_for_json(item) for item in obj]
        elif isinstance(obj, (pd.Timestamp, datetime)):
            return obj.isoformat()
        elif isinstance(obj, (np.integer, np.int64, np.int32)):
            return int(obj)
        elif isinstance(obj, (np.floating, np.float64, np.float32)):
            if np.isnan(obj) or np.isinf(obj):
                return None
            return float(obj)
        elif isinstance(obj, float):
            if np.isnan(obj) or np.isinf(obj):
                return None
            return obj
        elif isinstance(obj, np.bool_):
            return bool(obj)
        elif pd.isna(obj):
            return None
        return obj
    
    def persist_snapshot(self, datasource, snapshot):
        """
        Persist snapshot to cache and database
        
        Cache: Full data for fast access (1 hour TTL)
        Database: Metadata + FULL DATA (para garantir disponibilidade)
        """
        # Cache full snapshot (1 hour)
        cache_key = f"datasource_{datasource.id}_snapshot"
        cache.set(cache_key, snapshot, timeout=3600)
        
        # Clean snapshot for JSON serialization (convert NaN to None)
        # IMPORTANTE: Salvar full_data também no database
        clean_snapshot = {
            'timestamp': snapshot['timestamp'],
            'row_count': snapshot['row_count'],
            'column_count': snapshot['column_count'],
            'data_hash': snapshot['data_hash'],
            'schema': self._clean_for_json(snapshot['schema']),
            'sample_data': self._clean_for_json(snapshot['sample_data']),
            'full_data': self._clean_for_json(snapshot['full_data']),  # INCLUIR DADOS COMPLETOS
            'statistics': self._clean_for_json(snapshot['statistics'])
        }
        
        # Update datasource config with metadata + full data
        datasource.connection_config['last_snapshot'] = clean_snapshot
        datasource.save(update_fields=['connection_config', 'updated_at'])
        
        logger.info(f"Snapshot persisted for datasource {datasource.id} with {snapshot['row_count']} rows")
    
    def get_snapshot(self, datasource):
        """
        Retrieve snapshot from cache or database
        """
        # Try cache first
        cache_key = f"datasource_{datasource.id}_snapshot"
        snapshot = cache.get(cache_key)
        
        if snapshot:
            logger.debug(f"Snapshot retrieved from cache for datasource {datasource.id}")
            return snapshot
        
        # Fallback to database (metadata only)
        last_snapshot = datasource.connection_config.get('last_snapshot')
        
        if last_snapshot:
            logger.debug(f"Snapshot retrieved from database for datasource {datasource.id}")
            return last_snapshot
        
        logger.warning(f"No snapshot found for datasource {datasource.id}")
        return None
    
    def get_dataframe(self, datasource) -> pd.DataFrame:
        """
        Get DataFrame from snapshot
        """
        snapshot = self.get_snapshot(datasource)
        
        if not snapshot:
            raise ValueError(f"No snapshot found for datasource {datasource.id}")
        
        # Convert back to DataFrame
        full_data = snapshot.get('full_data')
        if not full_data:
            # Use sample data as fallback
            full_data = snapshot.get('sample_data', [])
        
        df = pd.DataFrame(full_data)
        
        # Restore types based on schema
        schema = snapshot.get('schema', {})
        for col, col_info in schema.items():
            if col in df.columns:
                dtype = col_info['dtype']
                if 'datetime' in dtype:
                    df[col] = pd.to_datetime(df[col], errors='coerce')
                elif 'int' in dtype or 'float' in dtype:
                    df[col] = pd.to_numeric(df[col], errors='coerce')
        
        return df
