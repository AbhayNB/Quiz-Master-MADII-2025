@echo off
celery -A celery_config beat --loglevel=info