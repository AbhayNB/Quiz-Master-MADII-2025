from celery import Celery
from flask import Flask
from datetime import timedelta
from config import Config
from models import db
from flask_mail import Mail
from celery.schedules import crontab
import pytz

mail = Mail()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)
    db.init_app(app)
    mail.init_app(app)
    with app.app_context():
        db.create_all()  # Create database tables
    return app

flask_app = create_app()

def make_celery(app):
    celery = Celery(
        'quiz_master',
        broker="redis://localhost:6379/0",
        backend="redis://localhost:6379/1",
        include=['tasks']
    )
    celery.conf.update(app.config)
    
    # Configure timezone
    celery.conf.timezone = 'Asia/Kolkata'
    
    # Configure Redis connection retry settings
    celery.conf.broker_transport_options = {
        'retry_on_startup': True,
        'max_retries': 3
    }
    
    class ContextTask(celery.Task):
        def __call__(self, *args, **kwargs):
            with app.app_context():
                return self.run(*args, **kwargs)

    celery.Task = ContextTask
    return celery

celery = make_celery(flask_app)

celery.conf.beat_schedule = {
    'daily-quiz-reminder': {
        'task': 'tasks.send_daily_quiz_reminder',
        'schedule': crontab(hour=17, minute=38),  # Will run at 10:05 PM IST
        'options': {'expires': 3600}
    },
    'monthly-performance-report': {
        'task': 'tasks.generate_monthly_performance_report',
        'schedule': crontab(day_of_month=1, hour=4, minute=30),  # Will run on 1st of each month at 10:00 AM IST
        'options': {'expires': 7200}
    }
}
