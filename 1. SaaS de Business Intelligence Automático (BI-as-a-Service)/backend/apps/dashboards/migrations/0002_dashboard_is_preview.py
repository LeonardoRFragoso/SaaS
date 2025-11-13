from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('dashboards', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='dashboard',
            name='is_preview',
            field=models.BooleanField(default=False, verbose_name='pr\u00e9-visualiza\u00e7\u00e3o'),
        ),
    ]

