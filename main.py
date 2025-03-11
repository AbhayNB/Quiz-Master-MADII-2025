from flask import Flask, render_template, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from models import db, User, Role, func
from config import Config
from auth import role_required
app = Flask(__name__)
app.config.from_object(Config)
db.init_app(app)
jwt = JWTManager(app)

def init_database():
    with app.app_context():
        db.create_all()
        if not Role.query.filter_by(name='admin').first():
            db.session.add(Role(name='admin'))
            db.session.add(Role(name='user'))
            db.session.commit()

@app.route('/')
def home():
    return render_template('index.html')


@app.route('/admin')
@role_required('admin')
def admin():
    return render_template('admin.html')

@app.route('/about')
def about():
    return "Test your knowledge"

@app.route('/contact')
def contact():
    return "Contact us"
@app.route('/activeusers', methods=['GET'])
def active_users():
     active_users=db.session.query(func.count(User.id)).scalar()
     print(active_users)
     return jsonify(active_users=active_users), 200

@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and user.check_password(data['password']):
        # Get the first role name since a user should have at least one role
        role_name = user.role[0].name if user.role else 'user'
        access_token = create_access_token(identity={'username': user.username, 'role': role_name})
        return jsonify(access_token=access_token), 200
    return jsonify({"msg": "Invalid credentials"}), 401

@app.route('/register', methods=['POST'])
def register():
    data = request.get_json()
    
    # Check for existing username
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"msg": "Username already exists"}), 400
    
    # Check for existing email
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"msg": "Email already exists"}), 400
    
    # Basic email validation
    if '@' not in data.get('email', ''):
        return jsonify({"msg": "Invalid email format"}), 400
    
    # Check required fields
    required_fields = ['username', 'email', 'password']
    if not all(field in data for field in required_fields):
        return jsonify({"msg": "Missing required fields"}), 400
    
    user_role = Role.query.filter_by(name='user').first()
    user = User(
        username=data['username'],
        email=data['email'],
        name=data.get('name'),  # name is optional
    )
    user.role = [user_role]  # Assign role as a list
    user.set_password(data['password'])
    db.session.add(user)
    db.session.commit()
    return jsonify({"msg": "User created successfully"}), 201

if __name__ == '__main__':
    init_database()
    app.run(debug=True)

