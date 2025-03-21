from celery import Celery

celery = Celery(
    'my_project',
    broker='redis://localhost:6379/0',  # Redis as broker
    backend='redis://localhost:6379/1'  # Store results in Redis
)

celery.conf.update(
    task_serializer='json',
    result_serializer='json',
    accept_content=['json'],
    timezone='Asia/Kolkata',
    enable_utc=True
)
