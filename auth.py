from flask import jsonify, Response, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from functools import wraps
from redis import Redis
import json
from datetime import timedelta

redis_client = Redis(host='localhost', port=6379, db=2)

# Configure rate limiter with Redis as storage
limiter = Limiter(
    key_func=get_remote_address,
    storage_uri="redis://localhost:6379",
    storage_options={"db": 3},
    default_limits=["200 per day", "50 per hour"],
    strategy="fixed-window-elastic-expiry"  # More forgiving strategy for burst requests
)

def apply_rate_limit(limit_string):
    def decorator(f):
        @limiter.limit(limit_string)
        @wraps(f)
        def decorated_function(*args, **kwargs):
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def role_required(role):
    def wrapper(fn):
        @jwt_required()
        def decorated_view(*args, **kwargs):
            current_user = get_jwt_identity()
            if role not in current_user['role']:
                return jsonify({"message": "Access denied"}), 403
            return fn(*args, **kwargs)
        return decorated_view
    return wrapper

def cache_response(timeout=300):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Create a cache key from the function name and arguments
            cache_key = f"{f.__name__}:{str(args)}:{str(kwargs)}"
            
            # Try to get the cached response
            cached_data = redis_client.get(cache_key)
            if cached_data:
                cached_response = json.loads(cached_data)
                # Reconstruct Response object if needed
                if isinstance(cached_response, dict) and 'headers' in cached_response:
                    return Response(
                        response=cached_response['data'],
                        status=cached_response['status'],
                        headers=cached_response['headers'],
                        mimetype=cached_response['mimetype']
                    )
                return jsonify(cached_response)
            
            # If no cache, execute the function
            response = f(*args, **kwargs)
            
            # Prepare response for caching
            if isinstance(response, Response):
                cache_data = {
                    'data': response.get_data(as_text=True),
                    'status': response.status_code,
                    'headers': dict(response.headers),
                    'mimetype': response.mimetype
                }
            elif isinstance(response, tuple):
                # Handle tuple responses (data, status_code)
                data, status_code = response
                cache_data = {'data': data, 'status': status_code}
            else:
                cache_data = response
            
            # Cache the response
            redis_client.setex(
                cache_key,
                timedelta(seconds=timeout),
                json.dumps(cache_data)
            )
            
            return response
        return decorated_function
    return decorator