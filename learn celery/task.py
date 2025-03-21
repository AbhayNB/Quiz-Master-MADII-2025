from celery_app import celery
import time

@celery.task
def add(x, y):
    time.sleep(10)  # Simulate a long task
    return x + y
