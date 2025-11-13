from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboards', '0003_merge'),
    ]

    operations = [
        migrations.AddField(
            model_name='dashboard',
            name='public_preview_token',
            field=models.CharField(default='', max_length=64, verbose_name='token de pr\u00e9-visualiza\u00e7\u00e3o p\u00fablica', blank=True),
        ),
        migrations.AddField(
            model_name='dashboard',
            name='public_preview_expires_at',
            field=models.DateTimeField(null=True, blank=True, verbose_name='expira em'),
        ),
    ]

