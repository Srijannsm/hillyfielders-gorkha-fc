from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('players', '0003_restructure_team_programme'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='player',
            unique_together={('team', 'jersey_number')},
        ),
    ]
