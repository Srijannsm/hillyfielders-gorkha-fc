from django.db import models
from django.utils import timezone
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.response import Response


class SoftDeleteQuerySet(models.QuerySet):
    def delete(self):
        return self.update(deleted_at=timezone.now())

    def restore(self):
        return self.update(deleted_at=None)


class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return SoftDeleteQuerySet(self.model, using=self._db).filter(deleted_at__isnull=True)


class SoftDeleteMixin(models.Model):
    """Abstract mixin: adds soft-delete support. `objects` excludes deleted rows."""
    deleted_at = models.DateTimeField(null=True, blank=True, db_index=True)

    objects = SoftDeleteManager()
    all_objects = models.Manager()

    class Meta:
        abstract = True

    def delete(self, using=None, keep_parents=False):
        self.deleted_at = timezone.now()
        self.save(update_fields=['deleted_at'])

    def restore(self):
        self.deleted_at = None
        self.save(update_fields=['deleted_at'])

    @property
    def is_deleted(self):
        return self.deleted_at is not None


class SoftDeleteAdminMixin:
    """
    ViewSet mixin for soft-deletable models.

    - DELETE → sets deleted_at (soft-delete), returns 204
    - GET ?deleted=true → lists only soft-deleted records
    - POST {pk}/restore/ → clears deleted_at, returns restored record
    """

    def get_queryset(self):
        qs = super().get_queryset()
        if self.request.query_params.get('deleted') == 'true':
            model = self.queryset.model
            return model.all_objects.filter(deleted_at__isnull=False).order_by('-deleted_at')
        return qs

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def restore(self, request, pk=None):
        model = self.queryset.model
        try:
            instance = model.all_objects.get(pk=pk)
        except model.DoesNotExist:
            return Response({'detail': 'Not found.'}, status=status.HTTP_404_NOT_FOUND)
        if not instance.is_deleted:
            return Response({'detail': 'Record is not deleted.'}, status=status.HTTP_400_BAD_REQUEST)
        instance.restore()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
