from sqlalchemy import Column, String, Integer, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class QuizAttempt(Base):
    __tablename__ = 'quiz_attempts'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    quiz_id = Column(Integer, nullable=False)
    score = Column(Float, nullable=False)
    total_questions = Column(Integer, nullable=False)
    correct_answers = Column(Integer, nullable=False)
    attempt_date = Column(DateTime, default=datetime.utcnow)

class PerformanceAnalysis(Base):
    __tablename__ = 'performance_analysis'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    average_score = Column(Float, nullable=False)
    attempts_count = Column(Integer, nullable=False)
    last_attempt_date = Column(DateTime)

class AITutorConversation(Base):
    __tablename__ = 'ai_tutor_conversations'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    conversation_date = Column(DateTime, default=datetime.utcnow)
    messages = Column(String, nullable=False)

class AdaptiveQuiz(Base):
    __tablename__ = 'adaptive_quizzes'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, nullable=False)
    quiz_id = Column(Integer, nullable=False)
    generated_date = Column(DateTime, default=datetime.utcnow)
    difficulty_level = Column(String, nullable=False)