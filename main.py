from flask import Flask, render_template, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from models import db, User, Role, Subject, Chapter, Quiz, Question, func
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
def admin():
    return render_template('admin.html')

@app.route('/about')
def about():
    return "Test your knowledge"

@app.route('/contact')
def contact():
    return "Contact us"



# ======== API's ==============

# Subject API's
@app.route('/create_subject', methods=['POST'])
def create_subject():
    data = request.get_json()
    if Subject.query.filter_by(name=data['name']).first():
        return jsonify({'msg': 'Subject already exists'})
    subject = Subject(
        name=data['name'],
        description=data['description']
    )
    db.session.add(subject)
    db.session.commit()
    return jsonify({'msg': 'Subject created successfully', 'subject': subject.to_dict()})

@app.route('/subjects', methods=['GET'])
def get_subjects():
    try:
        subjects = Subject.query.all()
        return jsonify(subjects=[subject.to_dict() for subject in subjects])
    except Exception as e:
        print(e)
        return jsonify({'msg': str(e)}), 500

@app.route('/delete_subject/<int:subject_id>', methods=['DELETE'])
def delete_subject(subject_id):
    subject = Subject.query.get(subject_id)
    
    if not subject:
        return jsonify({'error': 'Subject not found'}), 404

    db.session.delete(subject)
    db.session.commit()
    return jsonify({'message': 'Subject deleted successfully'}), 200

@app.route('/update_subject/<int:subject_id>', methods=['PUT'])
def update_subject(subject_id):
    subject = Subject.query.get(subject_id)
    if not subject:
        return jsonify({'msg': 'Subject not found'}), 404
    
    data = request.get_json()
    subject.name = data.get('name', subject.name)
    subject.description = data.get('description', subject.description)
    
    db.session.commit()
    return jsonify({
        'msg': 'Subject updated successfully',
        'subject': subject.to_dict()
    })

# Chapter API's
@app.route('/chapters/<int:subject_id>', methods=['GET'])
def get_chapters(subject_id):
    try:
        chapters = Chapter.query.filter_by(subject_id=subject_id).all()
        return jsonify(chapters=[{
            'id': chapter.id,
            'name': chapter.name,
            'description': chapter.description,
            'subject_id': chapter.subject_id,
            'quizCount': len(chapter.quizes)
        } for chapter in chapters])
    except Exception as e:
        return jsonify({'msg': str(e)}), 500

@app.route('/create_chapter', methods=['POST'])
def create_chapter():
    data = request.get_json()
    if Chapter.query.filter_by(name=data['name'], subject_id=data['subject_id']).first():
        return jsonify({'msg': 'Chapter already exists in this subject'})
    chapter = Chapter(
        name=data['name'],
        description=data['description'],
        subject_id=data['subject_id']
    )
    db.session.add(chapter)
    db.session.commit()
    return jsonify({
        'msg': 'Chapter created successfully', 
        'chapter': {
            'id': chapter.id,
            'name': chapter.name,
            'description': chapter.description,
            'subject_id': chapter.subject_id,
            'quizCount': 0
        }
    })

@app.route('/update_chapter/<int:chapter_id>', methods=['PUT'])
def update_chapter(chapter_id):
    chapter = Chapter.query.get(chapter_id)
    if not chapter:
        return jsonify({'msg': 'Chapter not found'}), 404
    
    data = request.get_json()
    chapter.name = data.get('name', chapter.name)
    chapter.description = data.get('description', chapter.description)
    
    db.session.commit()
    return jsonify({
        'msg': 'Chapter updated successfully',
        'chapter': {
            'id': chapter.id,
            'name': chapter.name,
            'description': chapter.description,
            'subject_id': chapter.subject_id,
            'quizCount': len(chapter.quizes)
        }
    })

@app.route('/delete_chapter/<int:chapter_id>', methods=['DELETE'])
def delete_chapter(chapter_id):
    chapter = Chapter.query.get(chapter_id)
    if not chapter:
        return jsonify({'error': 'Chapter not found'}), 404

    db.session.delete(chapter)
    db.session.commit()
    return jsonify({'message': 'Chapter deleted successfully'}), 200

# Quiz API's
@app.route('/create_quiz', methods=['POST'])
def create_quiz():
    try:
        data = request.get_json()
        if Quiz.query.filter_by(name=data['name'], chapter_id=data['chapter_id']).first():
            return jsonify({'msg': 'Quiz already exists in this chapter'})
        quiz = Quiz(
            name=data['name'],
            description=data['description'],
            difficulty=data['difficulty'],
            duration=data['duration'],
            chapter_id=data['chapter_id']
        )
        db.session.add(quiz)
        db.session.commit()
        return jsonify({
            'msg': 'Quiz created successfully', 
            'quiz': {
                'id': quiz.id,
                'name': quiz.name,
                'description': quiz.description,
                'difficulty': quiz.difficulty,
                'duration': quiz.duration,
                'chapter_id': quiz.chapter_id,
                'questionCount': 0
            }
        })
    except Exception as e:
        return jsonify({'msg': str(e)}), 500

@app.route('/quizzes/<int:chapter_id>', methods=['GET'])
def get_quizzes(chapter_id):
    try:
        quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all() 
        return jsonify(quizzes=[{
            'id': quiz.id,
            'name': quiz.name,
            'description': quiz.description,
            'difficulty': quiz.difficulty,
            'duration': quiz.duration,
            'chapter_id': quiz.chapter_id,
            'questionCount': len(quiz.questions)
        } for quiz in quizzes])
    except Exception as e:
        return jsonify({'msg': str(e)}), 500

@app.route('/update_quiz/<int:quiz_id>', methods=['PUT'])
def update_quiz(quiz_id):
    try:
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({'msg': 'Quiz not found'}), 404
        
        data = request.get_json()
        quiz.name = data.get('name', quiz.name)
        quiz.description = data.get('description', quiz.description)
        quiz.difficulty = data.get('difficulty', quiz.difficulty)
        quiz.duration = data.get('duration', quiz.duration)
        
        db.session.commit()
        return jsonify({
            'msg': 'Quiz updated successfully',
            'quiz': {
                'id': quiz.id,
                'name': quiz.name,
                'description': quiz.description,
                'difficulty': quiz.difficulty,
                'duration': quiz.duration,
                'chapter_id': quiz.chapter_id,
                'questionCount': len(quiz.questions)
            }
        })
    except Exception as e:
        return jsonify({'msg': str(e)}), 500

@app.route('/get_quiz/<int:quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    try:
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({'msg': 'Quiz not found'}), 404
        
        return jsonify({
            'id': quiz.id,
            'name': quiz.name,
            'description': quiz.description,
            'difficulty': quiz.difficulty,
            'duration': quiz.duration,
            'chapter_id': quiz.chapter_id,
            'questionCount': len(quiz.questions)
        })
    except Exception as e:
        return jsonify({'msg': str(e)}), 500

@app.route('/delete_quiz/<int:quiz_id>', methods=['DELETE'])
def delete_quiz(quiz_id):
    try:
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({'msg': 'Quiz not found'}), 404

        db.session.delete(quiz)
        db.session.commit()
        return jsonify({'msg': 'Quiz deleted successfully'}), 200
    except Exception as e:
        return jsonify({'msg': str(e)}), 500

# User API's

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

