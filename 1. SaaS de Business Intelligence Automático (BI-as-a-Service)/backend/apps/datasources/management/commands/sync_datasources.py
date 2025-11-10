from datetime import timedelta
import logging

from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.datasources.models import DataSource
from apps.datasources.services import DataSourceService

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Sincroniza automaticamente as fontes de dados com auto_sync habilitado.'

    def add_arguments(self, parser):
        parser.add_argument(
            '--force',
            action='store_true',
            help='Força a sincronização independentemente da frequência configurada.',
        )

    def handle(self, *args, **options):
        service = DataSourceService()
        force = options.get('force', False)
        now = timezone.now()
        synced = 0
        skipped = 0
        errors = 0

        queryset = DataSource.objects.filter(auto_sync=True, is_active=True)
        total = queryset.count()

        if total == 0:
            self.stdout.write(self.style.WARNING('Nenhuma fonte com auto_sync habilitado encontrada.'))
            return

        for datasource in queryset:
            if not force and not self._should_sync(datasource, now):
                skipped += 1
                continue

            try:
                service.sync_datasource(datasource)
                synced += 1
                self.stdout.write(
                    self.style.SUCCESS(
                        f'Sincronizado: {datasource.name} ({datasource.get_source_type_display()})'
                    )
                )
            except Exception as exc:  # noqa: BLE001
                errors += 1
                logger.exception('Erro ao sincronizar datasource %s: %s', datasource.id, exc)
                self.stderr.write(
                    self.style.ERROR(f'Erro ao sincronizar {datasource.name}: {exc}')
                )

        summary = (
            f'Sincronização concluída. Processadas: {total} | '
            f'Sincronizadas: {synced} | Ignoradas: {skipped} | Erros: {errors}'
        )
        self.stdout.write(self.style.SUCCESS(summary))

    def _should_sync(self, datasource: DataSource, now) -> bool:
        if datasource.sync_frequency == 'manual':
            return False

        last_sync = datasource.last_synced_at
        if not last_sync:
            return True

        delta = now - last_sync

        frequency_map = {
            'hourly': timedelta(hours=1),
            '6hours': timedelta(hours=6),
            'daily': timedelta(days=1),
        }

        expected_interval = frequency_map.get(datasource.sync_frequency)

        if not expected_interval:
            return False

        return delta >= expected_interval
