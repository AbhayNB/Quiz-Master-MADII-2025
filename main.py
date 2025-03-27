from flask import Flask, render_template, request, jsonify, Response
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from models import db, User, Role, Subject, Chapter, Quiz, Question, Attempt, func
from config import Config
from auth import role_required
from flask_mail import Mail
from workers import celery
from datetime import datetime  # Add this import
import tasks

app = Flask(__name__)
app.config.from_object(Config)

# Initialize extensions
db.init_app(app)
jwt = JWTManager(app)
mail = Mail(app)
mail.init_app(app)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  
# Configure Celery
celery.conf.update(app.config)
celery.conf.update(
    broker_connection_retry_on_startup=True,
    worker_prefetch_multiplier=1,
    timezone='Asia/Kolkata',  # Set to IST
    enable_utc=False,  # Disable UTC to use the specified timezone
    task_track_started=True,
    task_time_limit=30 * 60  # 30 minutes
)

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

@app.route('/chapter/<int:chapter_id>',methods=['GET'])
def get_chapter(chapter_id):
    chap=Chapter.query.get(chapter_id)
    return jsonify(chap.to_dict())

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
        
        # Check if chapter exists
        chapter = Chapter.query.get(data['chapter_id'])
        if not chapter:
            return jsonify({'msg': 'Chapter not found'}), 404
            
        if Quiz.query.filter_by(name=data['name'], chapter_id=data['chapter_id']).first():
            return jsonify({'msg': 'Quiz already exists in this chapter'}), 409
            
        # Parse datetime strings if they exist
        start_time = None
        end_time = None
        if data.get('start_time'):
            try:
                start_time = datetime.fromisoformat(data['start_time'])
            except ValueError as e:
                return jsonify({'msg': f'Invalid start_time format: {str(e)}'}), 400
                
        if data.get('end_time'):
            try:
                end_time = datetime.fromisoformat(data['end_time'])
            except ValueError as e:
                return jsonify({'msg': f'Invalid end_time format: {str(e)}'}), 400
            
        quiz = Quiz(
            name=data['name'],
            description=data['description'],
            difficulty=data['difficulty'],
            duration=data['duration'],
            chapter_id=data['chapter_id'],
            start_time=start_time,
            end_time=end_time
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
                'start_time': quiz.start_time.isoformat() if quiz.start_time else None,
                'end_time': quiz.end_time.isoformat() if quiz.end_time else None,
                'questionCount': 0
            }
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'msg': str(e)}), 500

@app.route('/quizzes/<int:chapter_id>', methods=['GET'])
def get_quizzes(chapter_id):
    try:
        quizzes = Quiz.query.filter_by(chapter_id=chapter_id).all()
        chapter = Chapter.query.get(chapter_id)
        subject = Subject.query.get(chapter.subject_id) if chapter else None
        
        return jsonify(quizzes=[{
            'id': quiz.id,
            'name': quiz.name,
            'description': quiz.description,
            'difficulty': quiz.difficulty,
            'duration': quiz.duration,
            'chapter_id': quiz.chapter_id,
            'start_time': quiz.start_time.isoformat() if quiz.start_time else None,
            'end_time': quiz.end_time.isoformat() if quiz.end_time else None,
            'questionCount': len(quiz.questions),
            'subject': subject.name if subject else 'Unknown',
            'chapter': chapter.name if chapter else 'Unknown'
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
        
        # Parse datetime strings if they exist
        if data.get('start_time'):
            try:
                data['start_time'] = datetime.fromisoformat(data['start_time'])
            except ValueError as e:
                return jsonify({'msg': f'Invalid start_time format: {str(e)}'}), 400
                
        if data.get('end_time'):
            try:
                data['end_time'] = datetime.fromisoformat(data['end_time'])
            except ValueError as e:
                return jsonify({'msg': f'Invalid end_time format: {str(e)}'}), 400
            
        for key, value in data.items():
            setattr(quiz, key, value)
            
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
                'start_time': quiz.start_time.isoformat() if quiz.start_time else None,
                'end_time': quiz.end_time.isoformat() if quiz.end_time else None,
                'questionCount': len(quiz.questions)
            }
        })
    except Exception as e:
        db.session.rollback()
        return jsonify({'msg': str(e)}), 500

@app.route('/get_quiz/<int:quiz_id>', methods=['GET'])
def get_quiz(quiz_id):
    try:
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            print('error for 1 quiz') 
            return jsonify({'msg': 'Quiz not found'}), 404
        
        chapter = Chapter.query.get(quiz.chapter_id)
        subject = Subject.query.get(chapter.subject_id) if chapter else None
        
        return jsonify({
            'id': quiz.id,
            'name': quiz.name,
            'description': quiz.description,
            'difficulty': quiz.difficulty,
            'duration': quiz.duration,
            'chapter_id': quiz.chapter_id,
            'start_time': quiz.start_time.isoformat() if quiz.start_time else None,
            'end_time': quiz.end_time.isoformat() if quiz.end_time else None,
            'questionCount': len(quiz.questions),
            'subject': subject.name if subject else 'Unknown',
            'chapter': chapter.name if chapter else 'Unknown'
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

@app.route('/quiz/<int:quiz_id>', methods=['GET'])
def get_single_quiz(quiz_id):
    try:
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({'msg': 'Quiz not found'}), 404
        
        chapter = Chapter.query.get(quiz.chapter_id)
        subject = Subject.query.get(chapter.subject_id) if chapter else None
        
        return jsonify({
            'id': quiz.id,
            'name': quiz.name,
            'description': quiz.description,
            'difficulty': quiz.difficulty,
            'duration': quiz.duration,
            'chapter_id': quiz.chapter_id,
            'start_time': quiz.start_time.isoformat() if quiz.start_time else None,
            'end_time': quiz.end_time.isoformat() if quiz.end_time else None,
            'questionCount': len(quiz.questions),
            'subject': subject.name if subject else 'Unknown',
            'chapter': chapter.name if chapter else 'Unknown'
        })
    except Exception as e:
        return jsonify({'msg': str(e)}), 500

# Questions API's

@app.route('/add_que/<int:quiz_id>', methods=['POST'])
def add_que(quiz_id):
    try:
        data = request.get_json()
        quiz = Quiz.query.get(quiz_id)
        if not quiz:
            return jsonify({'msg': 'Quiz not found'}), 404
        que=Question(
            question=data['question'],
            option1=data['option1'],
            option2=data['option2'],
            option3=data['option3'],
            option4=data['option4'],
            correct_option=data['correct_option'],
            quiz_id=quiz_id
        )
        db.session.add(que)
        db.session.commit()
        return jsonify({'msg': 'Question added successfully', 'question': {
            'id': que.id,
            'question': que.question,
            'option1': que.option1,
            'option2': que.option2,
            'option3': que.option3,
            'option4': que.option4,
            'correct_option': que.correct_option,
            'quiz_id': que.quiz_id
        }})
    except Exception as e:
        return jsonify({'msg': str(e)}), 500

@app.route('/get_ques/<int:quiz_id>', methods=['GET'])
def get_ques(quiz_id):
    try:
        questions = Question.query.filter_by(quiz_id=quiz_id).all()
        return jsonify(questions=[{
            'id': que.id,
            'question': que.question,
            'option1': que.option1,
            'option2': que.option2,
            'option3': que.option3,
            'option4': que.option4,
            'correct_option': que.correct_option,
            'quiz_id': que.quiz_id
        } for que in questions])
    except Exception as e:
        return jsonify({'msg': str(e)}), 500

@app.route('/delete_que/<int:que_id>', methods=['DELETE'])
def delete_que(que_id):
    try:
        que = Question.query.get(que_id)
        if not que:
            return jsonify({'msg': 'Question not found'}), 404
        db.session.delete(que)
        db.session.commit()
        return jsonify({'msg': 'Question deleted successfully'}), 200
    except Exception as e:
        return jsonify({'msg': str(e)}), 500

@app.route('/update_que/<int:que_id>', methods=['PUT'])
def update_que(que_id):   
    try:
        que = Question.query.get(que_id)
        if not que:
            return jsonify({'msg': 'Question not found'}), 404
        data = request.get_json()
        que.question = data.get('question', que.question)
        que.option1 = data.get('option1', que.option1)
        que.option2 = data.get('option2', que.option2)
        que.option3 = data.get('option3', que.option3)
        que.option4 = data.get('option4', que.option4)
        que.correct_option = data.get('correct_option', que.correct_option)
        db.session.commit()
        return jsonify({'msg': 'Question updated successfully', 'question': {
            'id': que.id,
            'question': que.question,
            'option1': que.option1,
            'option2': que.option2,
            'option3': que.option3,
            'option4': que.option4,
            'correct_option': que.correct_option,
            'quiz_id': que.quiz_id
        }})
    except Exception as e:
        return jsonify({'msg': str(e)}), 500

# User API's

@app.route('/activeusers', methods=['GET'])
def active_users():
     active_users=db.session.query(func.count(User.id)).scalar()
     print(active_users)
     return jsonify(active_users=active_users), 200

@app.route('/users', methods=['GET'])
@role_required('admin')
def get_users():
    try:
        users = User.query.all()
        return jsonify(users=[{
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'name': user.name,
            'roles': [role.name for role in user.role]
        } for user in users])
    except Exception as e:
        return jsonify({'msg': str(e)}), 500
@app.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    if user and user.check_password(data['password']):
        # Get the first role name since a user should have at least one role
        role_name = user.role[0].name if user.role else 'user'
        access_token = create_access_token(identity={'username': user.username, 'role': role_name})
        return jsonify(access_token=access_token,role=role_name,email=user.email,username=user.username), 200
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

# Quiz Attempt API
@app.route('/submit_quiz', methods=['POST'])
@jwt_required()
def submit_quiz():
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user['username']).first()
        
        if not user:
            return jsonify({'msg': 'User not found'}), 404

        data = request.get_json()
        quiz = Quiz.query.get(data['quiz_id'])
        
        if not quiz:
            return jsonify({'msg': 'Quiz not found'}), 404
            
        # Check if quiz is within valid time window
        now = datetime.utcnow()
        if quiz.start_time and now < quiz.start_time:
            return jsonify({'msg': 'Quiz has not started yet'}), 403
        if quiz.end_time and now > quiz.end_time:
            return jsonify({'msg': 'Quiz has already ended'}), 403

        # Continue with existing validation and submission logic
        required_fields = ['quiz_id', 'score', 'time_spent', 'answers', 
                         'totalQuestions', 'correctAnswers', 'status']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                'msg': 'Missing required fields',
                'missing_fields': missing_fields
            }), 422
            
        if not isinstance(data['answers'], dict):
            return jsonify({
                'msg': 'Invalid answers format. Expected a JSON object.'
            }), 422
            
        if data['status'] not in ['Passed', 'Failed']:
            return jsonify({
                'msg': 'Invalid status value. Must be either "Passed" or "Failed"'
            }), 422

        attempt = Attempt(
            user_id=user.id,
            quiz_id=data['quiz_id'],
            score=data['score'],
            timespent=data['time_spent'],
            submitted_answers=data['answers'], 
            totalQuestions=data['totalQuestions'],
            correctAnswers=data['correctAnswers'],
            status=data['status']
        )
        db.session.add(attempt)
        db.session.commit()
        
        return jsonify({
            'msg': 'Quiz submission successful',
            'attempt': {
                'id': attempt.id,
                'score': attempt.score,
                'status': attempt.status
            }
        }), 201

    except Exception as e:
        return jsonify({'msg': str(e)}), 500

@app.route('/get_attempts', methods=['GET'])
@jwt_required()
def get_attempts():
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user['username']).first()
        
        if not user:
            return jsonify({'msg': 'User not found'}), 404

        attempts = Attempt.query.filter_by(user_id=user.id).order_by(Attempt.timestamp.desc()).all()
        
        attempts_data = []
        for attempt in attempts:
            quiz = Quiz.query.get(attempt.quiz_id)
            if quiz:
                chapter = Chapter.query.get(quiz.chapter_id)
                subject = Subject.query.get(chapter.subject_id) if chapter else None
                
                attempts_data.append({
                    'id': attempt.id,
                    'quiz_id': attempt.quiz_id,
                    'name': quiz.name,
                    'subject': subject.name if subject else 'Unknown',
                    'questions': attempt.totalQuestions,
                    'score': attempt.score,
                    'date': attempt.timestamp.isoformat(),
                    'status': attempt.status,
                    'timespent': attempt.timespent
                })
        
        return jsonify({'history': attempts_data}), 200
    except Exception as e:
        return jsonify({'msg': str(e)}), 500

@app.route('/user/summary', methods=['GET'])
@jwt_required()
def get_user_summary():
    print('entered')
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user['username']).first()
        
        if not user:
            print('user not found')
            return jsonify({'msg': 'User not found'}), 404

        # Get all user attempts
        attempts = Attempt.query.filter_by(user_id=user.id).all()
        
        # Calculate total quizzes attempted
        total_quizzes = len(attempts)
        
        # Calculate average score
        if total_quizzes > 0:
            average_score = sum(attempt.score for attempt in attempts) / total_quizzes
        else:
            average_score = 0
            
        # Calculate quizzes taken this month
        from datetime import datetime
        current_month = datetime.utcnow().month
        current_year = datetime.utcnow().year
        quizzes_this_month = sum(
            1 for attempt in attempts 
            if attempt.timestamp.month == current_month 
            and attempt.timestamp.year == current_year
        )
        
        # Calculate subject performance
        subject_performance = {}
        for attempt in attempts:
            quiz = Quiz.query.get(attempt.quiz_id)
            if quiz:
                chapter = Chapter.query.get(quiz.chapter_id)
                if chapter:
                    subject = Subject.query.get(chapter.subject_id)
                    if subject:
                        if subject.name not in subject_performance:
                            subject_performance[subject.name] = {'total': 0, 'sum': 0}
                        subject_performance[subject.name]['total'] += 1
                        subject_performance[subject.name]['sum'] += attempt.score
        
        subject_avg_scores = [
            {
                'subject': subject,
                'average_score': data['sum'] / data['total']
            }
            for subject, data in subject_performance.items()
        ]
        
        # Find best subject
        best_subject = max(subject_performance.items(), 
                         key=lambda x: x[1]['sum'] / x[1]['total'], 
                         default=(None, None))[0] if subject_performance else None
        
        # Calculate monthly activity
        from collections import defaultdict
        monthly_activity = defaultdict(int)
        for attempt in attempts:
            month_key = attempt.timestamp.strftime('%B %Y')
            monthly_activity[month_key] += 1
        
        monthly_data = [
            {'month': month, 'count': count}
            for month, count in monthly_activity.items()
        ]
        
        # Get recent quizzes (last 5 attempts)
        recent_quizzes = []
        recent_attempts = Attempt.query.filter_by(user_id=user.id)\
            .order_by(Attempt.timestamp.desc())\
            .limit(5).all()
            
        for attempt in recent_attempts:
            quiz = Quiz.query.get(attempt.quiz_id)
            if quiz:
                chapter = Chapter.query.get(quiz.chapter_id)
                subject = Subject.query.get(chapter.subject_id) if chapter else None
                
                recent_quizzes.append({
                    'id': attempt.id,
                    'name': quiz.name,
                    'subject': subject.name if subject else 'Unknown',
                    'questions': attempt.totalQuestions,
                    'score': attempt.score,
                    'date': attempt.timestamp.isoformat(),
                    'status': attempt.status
                })
        
        return jsonify({
            'total_quizzes': total_quizzes,
            'average_score': average_score,
            'quizzes_this_month': quizzes_this_month,
            'best_subject': best_subject,
            'subject_performance': subject_avg_scores,
            'monthly_activity': monthly_data,
            'recent_quizzes': recent_quizzes
        }), 200
        
    except Exception as e:
        return jsonify({'msg': str(e)}), 500

@app.route('/export_attempts_csv', methods=['POST'])
@jwt_required()
def export_attempts_csv():
    try:
        current_user = get_jwt_identity()
        user = User.query.filter_by(username=current_user['username']).first()
        
        if not user:
            return jsonify({'msg': 'User not found'}), 404

        print(f"Starting export for user {user.username} (ID: {user.id})")
        # Start the export task with string ID
        task = tasks.export_quiz_history.delay(str(user.id))
        
        return jsonify({
            'task_id': task.id,
            'status': 'processing'
        }), 202

    except Exception as e:
        return jsonify({'msg': str(e)}), 500

@app.route('/get_export/<task_id>', methods=['GET'])
@jwt_required()
def get_export(task_id):
    try:
        # Check if the task is complete
        task = tasks.export_quiz_history.AsyncResult(task_id)
        
        if task.ready():
            result = task.get()
            
            # Check for error status in result
            if isinstance(result, dict):
                if result['status'] == 'completed':
                    # Get the CSV content from Redis
                    csv_content = celery.backend.get(f'csv_export_{task_id}')
                    if csv_content:
                        return Response(
                            csv_content.decode('utf-8'),
                            mimetype='text/csv',
                            headers={
                                'Content-Disposition': 'attachment; filename=quiz_history.csv'
                            }
                        )
                elif result['status'] == 'error':
                    # Return the error message with a 400 status code
                    return jsonify({
                        'msg': result['error'],
                        'status': 'error'
                    }), 400
            
            return jsonify({'msg': 'Export data not found'}), 404
        
        # Task is not ready yet
        return jsonify({
            'status': task.status,
            'ready': False
        }), 202

    except Exception as e:
        return jsonify({'msg': str(e)}), 500

@app.route('/hello', methods=['GET','POST'])
def hello():
    job=tasks.print_hello.delay('World')
    return str(job.id), 200

@app.route('/send', methods=['GET'])
def send_mail():
    job=tasks.send_daily_quiz_reminder.delay()
    return job.state, 200

if __name__ == '__main__':
    init_database()
    app.run(debug=True)

