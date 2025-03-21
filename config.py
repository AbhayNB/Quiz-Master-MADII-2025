class Config:
    SECRET_KEY = 'super-secret-key'
    SQLALCHEMY_DATABASE_URI = 'sqlite:///db5.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_SECRET_KEY = 'jwt-secret-string'
    UPLOAD_FOLDER='uploads/'
    ALLOWED_EXTENSIONS={'pdf'}
    
    # Email Configuration
    MAIL_SERVER = 'smtp.gmail.com'
    MAIL_USERNAME = 'email.abhaynarayanbairagi@gmail.com'  
    MAIL_PASSWORD = 'yooi eeji ybej wneu'     
    MAIL_USE_TLS = True
    MAIL_PORT = 587
    MAIL_DEFAULT_SENDER = 'email.abhaynarayanbairagi@gmail.com'  

    # Celery Configuration (new style)
    broker_url = 'redis://localhost:6379/0'
    result_backend = 'redis://localhost:6379/1'
    accept_content = ['json']
    task_serializer = 'json'
    result_serializer = 'json'
    timezone = 'Asia/Kolkata'
    enable_utc = True
    task_track_started = True
    task_time_limit = 30 * 60  # 30 minutes
    broker_connection_retry_on_startup = True
    worker_prefetch_multiplier = 1

class LocalDevelopmentConfig(Config):
    DEBUG = True
