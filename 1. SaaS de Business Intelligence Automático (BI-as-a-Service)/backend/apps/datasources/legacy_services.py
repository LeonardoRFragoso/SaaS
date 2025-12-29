import pandas as pd
import json
from django.utils import timezone
from .models import DataSource


class DataSourceService:
    """Serviço para gerenciar fontes de dados"""
    
    def create_from_csv(self, organization, user, name, dataframe):
        """Criar fonte de dados a partir de CSV"""
        # Converter DataFrame para JSON
        data_json = dataframe.to_dict('records')
        columns = dataframe.columns.tolist()
        
        datasource = DataSource.objects.create(
            organization=organization,
            created_by=user,
            name=name,
            source_type='csv_upload',
            connection_config={
                'columns': columns,
                'data': data_json,
            },
            is_active=True,
            row_count=len(dataframe),
            last_synced_at=timezone.now()
        )
        
        return datasource
    
    def connect_google_sheets(self, organization, user, name, url):
        """
        Conectar Google Sheets (Plano Free - Requer planilha pública)
        
        IMPORTANTE: Para o plano Free, a planilha deve estar pública.
        Instruções:
        1. Abra a planilha no Google Sheets
        2. Clique em "Compartilhar" no canto superior direito
        3. Em "Acesso geral", selecione "Qualquer pessoa com o link"
        4. Copie e cole a URL aqui
        
        Para planos pagos (Starter+), oferecemos conexão segura via OAuth2
        sem necessidade de tornar a planilha pública.
        """
        # Extrair sheet_id da URL
        sheet_id = self._extract_sheet_id(url)
        
        # Tentar ler dados do Google Sheets
        try:
            # URL pública do Google Sheets em formato CSV
            # Funciona apenas se a planilha estiver com acesso público
            gid = self._extract_gid(url)
            urls_to_try = [
                f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={gid}",
                f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv",
                f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid=0",
            ]
            last_error = None
            df = None
            used_gid = gid
            for u in urls_to_try:
                try:
                    df = pd.read_csv(u)
                    if 'gid=' in u:
                        try:
                            used_gid = int(u.split('gid=')[1].split('&')[0])
                        except Exception:
                            used_gid = gid
                    break
                except Exception as e:
                    last_error = e
                    continue
            if df is None:
                raise last_error
            
            # Verificar limite de linhas
            if len(df) > organization.max_data_rows:
                raise ValueError(
                    f'Planilha excede o limite de {organization.max_data_rows} linhas. '
                    f'Plano {organization.plan.upper()} permite até {organization.max_data_rows} linhas. '
                    f'Faça upgrade para aumentar o limite.'
                )
            
            # Salvar dados
            data_json = df.to_dict('records')
            columns = df.columns.tolist()
            
            # Detectar múltiplas abas (tentativa heurística via gids 0..10)
            sheets = []
            for gid in range(0, 11):
                try:
                    test_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={gid}"
                    sample_df = pd.read_csv(test_url, nrows=5)
                    if sample_df.shape[1] > 0:
                        sheets.append({
                            'gid': gid,
                            'title': f'Aba {gid}',
                            'columns': sample_df.columns.tolist()
                        })
                except Exception:
                    continue
            if not sheets:
                sheets = [{'gid': 0, 'title': 'Aba 0', 'columns': columns}]
            
            datasource = DataSource.objects.create(
                organization=organization,
                created_by=user,
                name=name,
                source_type='google_sheets',
                connection_config={
                    'url': url,
                    'sheet_id': sheet_id,
                    'primary_gid': used_gid,
                    'columns': columns,
                    'data': data_json,
                    'sheets': sheets,
                    'access_type': 'public',  # Free plan usa acesso público
                },
                is_active=True,
                row_count=len(df),
                last_synced_at=timezone.now()
            )
            
            return datasource
            
        except pd.errors.ParserError as e:
            raise ValueError(
                'Erro ao ler a planilha. Verifique se ela está pública. '
                'Vá em Compartilhar > Acesso geral > Qualquer pessoa com o link.'
            )
        except Exception as e:
            error_msg = str(e)
            if '403' in error_msg or 'Forbidden' in error_msg:
                raise ValueError(
                    'Acesso negado. A planilha precisa estar pública. '
                    'Instruções: Compartilhar > Acesso geral > Qualquer pessoa com o link. '
                    'Ou faça upgrade para Starter e conecte planilhas privadas via OAuth2.'
                )
            elif '404' in error_msg or 'Not Found' in error_msg:
                raise ValueError(
                    'Planilha não encontrada. Verifique se a URL está correta.'
                )
            elif '400' in error_msg or 'Bad Request' in error_msg:
                raise ValueError(
                    'Erro 400 ao acessar o Google Sheets. Verifique se a URL é de uma planilha (docs.google.com/spreadsheets/d/...) '
                    'e se está com acesso "Qualquer pessoa com o link". Caso haja várias abas, copie o link com o #gid da aba desejada.'
                )
            else:
                raise ValueError(f'Erro ao conectar Google Sheets: {error_msg}')
    
    def sync_datasource(self, datasource):
        """Sincronizar dados da fonte"""
        if datasource.source_type == 'google_sheets':
            return self._sync_google_sheets(datasource)
        elif datasource.source_type == 'csv_upload':
            # CSV upload não precisa sincronizar
            return datasource
        else:
            raise ValueError(f'Tipo de fonte não suportado: {datasource.source_type}')
    
    def _sync_google_sheets(self, datasource):
        """Sincronizar Google Sheets"""
        config = datasource.connection_config
        sheet_id = config.get('sheet_id')
        gid = config.get('primary_gid', 0)
        
        try:
            csv_url = f"https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv&gid={gid}"
            df = pd.read_csv(csv_url)
            
            # Verificar limite de linhas
            if len(df) > datasource.organization.max_data_rows:
                raise ValueError(f'Planilha excede o limite de {datasource.organization.max_data_rows} linhas')
            
            # Atualizar dados
            data_json = df.to_dict('records')
            columns = df.columns.tolist()
            
            datasource.connection_config['data'] = data_json
            datasource.connection_config['columns'] = columns
            datasource.row_count = len(df)
            datasource.last_synced_at = timezone.now()
            datasource.save()
            
            return datasource
            
        except Exception as e:
            raise ValueError(f'Erro ao sincronizar: {str(e)}')
    
    def get_data(self, datasource):
        """Obter dados da fonte"""
        # Primeiro tentar buscar do snapshot (dados completos)
        from apps.datasources.services.data_ingestion_service import DataIngestionService
        
        ingestion_service = DataIngestionService()
        snapshot = ingestion_service.get_snapshot(datasource)
        
        if snapshot and snapshot.get('full_data'):
            # Dados completos do snapshot
            return {
                'columns': list(snapshot.get('schema', {}).keys()),
                'rows': snapshot['full_data'],
                'total_rows': snapshot.get('row_count', len(snapshot['full_data'])),
                'sheets': [],
            }
        
        # Fallback: buscar de connection_config (dados antigos)
        config = datasource.connection_config
        data = config.get('data', [])
        columns = config.get('columns', [])
        sheets = config.get('sheets', [])
        
        return {
            'columns': columns,
            'rows': data,
            'total_rows': len(data),
            'sheets': sheets,
        }
    
    def _extract_sheet_id(self, url):
        """Extrair ID da planilha da URL"""
        # URL formato: https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit...
        if '/d/' in url:
            parts = url.split('/d/')
            if len(parts) > 1:
                sheet_id = parts[1].split('/')[0]
                return sheet_id
        raise ValueError('URL do Google Sheets inválida')

    def _extract_gid(self, url):
        if '#gid=' in url:
            try:
                return int(url.split('#gid=')[1].split('&')[0])
            except Exception:
                return 0
        return 0
