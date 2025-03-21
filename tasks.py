from celery_config import celery, flask_app, mail
from flask_mail import Message
from datetime import datetime, timedelta
from models import User, Quiz, Attempt, Subject, Chapter
from flask import current_app
import json
from sqlalchemy import func
from models import db
# Register tasks with the Celery instance
@celery.task(name='tasks.print_hello')
def print_hello(name):
    print(f"Hello2 World {name}")
    return f"Hello, {name}!"

from sqlalchemy.sql import exists

@celery.task(name='tasks.send_daily_quiz_reminder')
def send_daily_quiz_reminder():
    """Send daily quiz reminders to users who haven't taken a quiz in the last 24 hours"""
    with flask_app.app_context():
        try:
            yesterday = datetime.utcnow() - timedelta(days=1)

            # Get users who haven't taken a quiz in the last 24 hours
            users = User.query.filter(
                ~User.id.in_(
                    db.session.query(Attempt.user_id)
                    .filter(Attempt.timestamp > yesterday)
                    .distinct()
                )
            ).all()

            for user in users:
                msg = Message(
                    'Daily Quiz Reminder',
                    recipients=[user.email]
                )
                print(f"Sending reminder to {user.email}")
                msg.body = f"""
                Hello {user.username},

                Don't forget to take your daily quiz! Keep learning and improving.

                Best regards,
                Quiz Master Team
                """
                mail.send(msg)

            return True
        except Exception as e:
            print(f"Error in send_daily_quiz_reminder: {str(e)}")
            return False


@celery.task(name='tasks.generate_monthly_performance_report')
def generate_monthly_performance_report():
    """Generate and send monthly performance reports to all users"""
    with flask_app.app_context():
        try:
            users = User.query.all()
            last_month = datetime.utcnow().replace(day=1) - timedelta(days=1)
            
            for user in users:
                # Get last month's attempts
                monthly_attempts = Attempt.query.filter(
                    Attempt.user_id == user.id,
                    func.extract('month', Attempt.timestamp) == last_month.month,
                    func.extract('year', Attempt.timestamp) == last_month.year
                ).all()

                if monthly_attempts:
                    # Calculate statistics
                    total_quizzes = len(monthly_attempts)
                    avg_score = sum(a.score for a in monthly_attempts) / total_quizzes
                    total_time = sum(a.timespent for a in monthly_attempts)
                    pass_rate = sum(1 for a in monthly_attempts if a.status == 'Passed') / total_quizzes * 100

                    # Subject-wise performance
                    subject_performance = {}
                    for attempt in monthly_attempts:
                        quiz = Quiz.query.get(attempt.quiz_id)
                        if quiz:
                            chapter = Chapter.query.get(quiz.chapter_id)
                            if chapter:
                                subject = Subject.query.get(chapter.subject_id)
                                if subject:
                                    if subject.name not in subject_performance:
                                        subject_performance[subject.name] = {'attempts': 0, 'total_score': 0}
                                    subject_performance[subject.name]['attempts'] += 1
                                    subject_performance[subject.name]['total_score'] += attempt.score

                    # Format subject performance
                    subject_report = "\n".join([
                        f"- {subject}: {data['total_score']/data['attempts']:.1f}% (from {data['attempts']} quizzes)"
                        for subject, data in subject_performance.items()
                    ])

                    # Send email report
                    msg = Message(
                        f'Monthly Performance Report - {last_month.strftime("%B %Y")}',
                        recipients=[user.email],
                        body=f"""Hi {user.username},

Here's your performance report for {last_month.strftime("%B %Y")}:

Total Quizzes Attempted: {total_quizzes}
Average Score: {avg_score:.1f}%
Total Time Spent: {total_time} minutes
Pass Rate: {pass_rate:.1f}%

Subject-wise Performance:
{subject_report}

Keep up the great work!

Best regards,
Quiz Master Team"""
                    )
                    mail.send(msg)

        except Exception as e:
            print(f"Error in generate_monthly_performance_report: {str(e)}")
            return False
        return True
