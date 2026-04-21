import os

from django.db import connection
from django.utils import timezone
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny


def _check_redis():
    redis_url = os.getenv('REDIS_URL')
    if not redis_url:
        return 'not_configured'
    try:
        import redis
        r = redis.from_url(redis_url, socket_connect_timeout=2)
        r.ping()
        return 'ok'
    except Exception:
        return 'error'


def _check_cloudinary():
    if not os.getenv('CLOUDINARY_CLOUD_NAME'):
        return 'not_configured'
    try:
        import cloudinary.api
        cloudinary.api.ping()
        return 'ok'
    except Exception:
        return 'error'


class HealthCheckView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        tags=['health'],
        summary='Health check',
        description='Returns database, Redis, and Cloudinary connectivity status. Used by Railway monitoring.',
        responses={200: inline_serializer('HealthResponse', fields={
            'status': serializers.CharField(),
            'database': serializers.CharField(),
            'redis': serializers.CharField(),
            'cloudinary': serializers.CharField(),
            'timestamp': serializers.DateTimeField(),
        })},
    )
    def get(self, request):
        db_status = 'ok'
        try:
            connection.ensure_connection()
        except Exception:
            db_status = 'error'

        redis_status = _check_redis()
        cloudinary_status = _check_cloudinary()

        overall = 'ok' if all(
            s in ('ok', 'not_configured')
            for s in [db_status, redis_status, cloudinary_status]
        ) else 'degraded'

        return Response({
            'status': overall,
            'database': db_status,
            'redis': redis_status,
            'cloudinary': cloudinary_status,
            'timestamp': timezone.now().isoformat(),
        })
