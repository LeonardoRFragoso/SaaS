from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('dashboards', '0002_dashboard_is_preview'),
        ('dashboards', '0002_initial'),
    ]

    operations = [
        # Merge migration: apenas resolve o DAG de migrations; sem alterações adicionais
    ]

