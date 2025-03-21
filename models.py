from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy.orm import relationship
from datetime import datetime
from sqlalchemy import Float,func, CheckConstraint, Enum
from sqlalchemy.dialects.postgresql import JSON
db = SQLAlchemy()

# Association table between User and Role
user_roles = db.Table('user_roles',
    db.Column('user_id', db.Integer, db.ForeignKey('user.id'), primary_key=True),
    db.Column('role_id', db.Integer, db.ForeignKey('role.id'), primary_key=True)
)

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)
    name = db.Column(db.String(80), nullable=True) 
    role = relationship('Role', secondary=user_roles, backref=db.backref('users', lazy=True))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
    
    def to_dict(self):
        return {
            'id': self.id,
            'username': self.username,
            'email': self.email,
            'name': self.name,
            'roles': [role.name for role in self.role]
        }

class Role(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)

class Subject(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)

    # One Subject -> Many Chapters
    chapters = db.relationship('Chapter', backref='subject', lazy=True)  

    def to_dict(self):
        chap_count= len(self.chapters)
        quiz_count = sum(len(chapter.quizes) for chapter in self.chapters)
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'quizCount': quiz_count,
            'chapterCount': chap_count
            
        }

class Chapter(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    description = db.Column(db.String(255), nullable=True)
    subject_id = db.Column(db.Integer, db.ForeignKey('subject.id'), nullable=False)  
    quizes = db.relationship('Quiz', backref='chapter', lazy=True)  

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'subject_id': self.subject_id,
            'quizCount': len(self.quizes)
        }
class Quiz(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), unique=True, nullable=False)
    description = db.Column(db.String(255), nullable=True)
    difficulty = db.Column(Enum('Easy', 'Medium', 'Hard', name='difficulty_enum'), nullable=True)
    duration = db.Column(db.Integer, nullable=False)
    chapter_id = db.Column(db.Integer, db.ForeignKey('chapter.id'), nullable=False)
    questions = db.relationship('Question', backref='quiz', lazy=True)
    

class Question(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    question = db.Column(db.String(255), nullable=False)
    
    option1 = db.Column(db.String(255), nullable=False)
    option2 = db.Column(db.String(255), nullable=False)
    option3 = db.Column(db.String(255), nullable=False)
    option4 = db.Column(db.String(255), nullable=False)

    correct_option = db.Column(db.Integer, nullable=False) 

    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)

    __table_args__ = (
        CheckConstraint('correct_option BETWEEN 1 AND 4', name='check_correct_option'),
    )

    def get_correct_answer(self):
        """Returns the correct option text."""
        return getattr(self, f'option{self.correct_option}')

    def to_dict(self):
        """Convert question to JSON-friendly dictionary."""
        return {
            "id": self.id,
            "question": self.question,
            "options": [self.option1, self.option2, self.option3, self.option4],
            "correct_option": self.correct_option,  
            "quiz_id": self.quiz_id,
        }

class Attempt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    score = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    timespent = db.Column(db.Integer, nullable=False)
    submitted_answers = db.Column(JSON, nullable=False)
    totalQuestions = db.Column(db.Integer, nullable=False)
    correctAnswers = db.Column(db.Integer, nullable=False)
    status = db.Column(Enum('Passed', 'Failed', name='status_enum'), nullable=False)

class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    quiz_id = db.Column(db.Integer, db.ForeignKey('quiz.id'), nullable=False)
    score = db.Column(db.Float, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)

    user = db.relationship('User', backref=db.backref('scores', lazy=True))
    quiz = db.relationship('Quiz', backref=db.backref('scores', lazy=True))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'quiz_id': self.quiz_id,
            'score': self.score,
            'timestamp': self.timestamp.isoformat()
        }
    

class Log(db.Model):
    id=db.Column(db.Integer,primary_key=True)
    type = db.Column(Enum(
        'quiz_added', 
        'user_registered', 
        'subject_added', 
        'chapter_added', 
        'quiz_updated', 
        'user_updated', 
        'subject_updated', 
        'chapter_updated', 
        'quiz_deleted', 
        'user_deleted', 
        'subject_deleted', 
        'chapter_deleted', 
        name='recent_type'
    ))
    info=db.Column(db.String(255), nullable=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
