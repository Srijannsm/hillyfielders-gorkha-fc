"""
Migration: Replace flat team_type choices with Programme + Team hierarchy.

Steps:
  1. Create Programme table
  2. Add new nullable/defaulted fields to Team
  3. Data migration — create the two Programme rows, map existing teams
  4. Make programme non-nullable
  5. Drop old team_type field
"""

from django.db import migrations, models
import django.db.models.deletion


# ── Human-readable names for old team_type suffixes ─────────
SUFFIX_TO_NAME = {
    'senior': 'Senior Team',
    'u16':    'U-16',
    'u14':    'U-14',
    'u12':    'U-12',
}


def migrate_forward(apps, schema_editor):
    Team      = apps.get_model('players', 'Team')
    Programme = apps.get_model('players', 'Programme')

    mens   = Programme.objects.create(gender='mens',   name="Men's Programme",   is_active=True)
    womens = Programme.objects.create(gender='womens', name="Women's Programme", is_active=True)

    for team in Team.objects.all():
        team_type = team.team_type  # e.g. 'mens-u16'
        if team_type.startswith('womens-'):
            programme = womens
            suffix    = team_type[len('womens-'):]
        else:
            programme = mens
            suffix    = team_type[len('mens-'):]

        team.programme  = programme
        team.slug       = team_type                          # reuse existing slug
        team.name       = SUFFIX_TO_NAME.get(suffix, suffix.title())
        team.is_active  = True
        team.order      = 0
        team.save()


def migrate_backward(apps, schema_editor):
    """Restore team_type from slug (reverse is best-effort)."""
    Team = apps.get_model('players', 'Team')
    for team in Team.objects.all():
        team.team_type = team.slug
        team.save()


class Migration(migrations.Migration):

    dependencies = [
        ('players', '0002_alter_team_team_type'),
    ]

    operations = [

        # 1. Create Programme model
        migrations.CreateModel(
            name='Programme',
            fields=[
                ('id',        models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('gender',    models.CharField(choices=[('mens', "Men's"), ('womens', "Women's")], max_length=10, unique=True)),
                ('name',      models.CharField(max_length=100)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={'ordering': ['gender']},
        ),

        # 2a. Add programme FK (nullable for now — filled in step 3)
        migrations.AddField(
            model_name='team',
            name='programme',
            field=models.ForeignKey(
                null=True, blank=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='teams',
                to='players.programme',
            ),
        ),

        # 2b. Add slug (blank=True so data migration sets it)
        migrations.AddField(
            model_name='team',
            name='slug',
            field=models.SlugField(max_length=60, unique=False, blank=True, default=''),
        ),

        # 2c. Add is_active
        migrations.AddField(
            model_name='team',
            name='is_active',
            field=models.BooleanField(default=True),
        ),

        # 2d. Add order
        migrations.AddField(
            model_name='team',
            name='order',
            field=models.PositiveIntegerField(default=0),
        ),

        # 3. Data migration
        migrations.RunPython(migrate_forward, migrate_backward),

        # 4. Make programme non-nullable now that all rows are filled
        migrations.AlterField(
            model_name='team',
            name='programme',
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name='teams',
                to='players.programme',
            ),
        ),

        # 5. Make slug unique now that all rows have distinct values
        migrations.AlterField(
            model_name='team',
            name='slug',
            field=models.SlugField(
                max_length=60,
                unique=True,
                help_text="Auto-generated from programme + name. You can override it.",
            ),
        ),

        # 6. Remove old team_type field
        migrations.RemoveField(model_name='team', name='team_type'),
    ]
