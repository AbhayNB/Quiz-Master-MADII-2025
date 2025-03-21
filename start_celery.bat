@echo off
REM Start Redis if not running (adjust path as needed)
start "" "C:\Program Files\Redis\redis-server.exe"

REM Start Celery worker
start cmd /k "celery -A tasks.celery worker --loglevel=info"

REM Start Celery beat scheduler
start cmd /k "celery -A tasks.celery beat --loglevel=info"

REM Start Flower monitoring (optional)
start "Flower Monitor" cmd /k "celery -A celery_app.celery flower"