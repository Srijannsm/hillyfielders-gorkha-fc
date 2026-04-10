web: gunicorn core.wsgi --workers 2 --timeout 60 --log-file -
worker: celery -A core worker --loglevel=info --concurrency=2
