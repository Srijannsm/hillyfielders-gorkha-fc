from django.apps import AppConfig

class TrainingTypesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'training_types'

    def ready(self):
        import training_types.signals