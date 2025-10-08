from google.cloud import firestore
import random

class QuizGenerator:
    def __init__(self):
        self.db = firestore.Client()

    def generate_quiz(self, user_id, topic, difficulty_level):
        questions = self.fetch_questions(topic, difficulty_level)
        quiz = {
            'user_id': user_id,
            'topic': topic,
            'difficulty_level': difficulty_level,
            'questions': questions,
            'attempted': False
        }
        self.save_quiz_to_db(quiz)
        return quiz

    def fetch_questions(self, topic, difficulty_level):
        questions_ref = self.db.collection('questions')
        query = questions_ref.where('topic', '==', topic).where('difficulty', '==', difficulty_level)
        questions = query.stream()
        return [question.to_dict() for question in questions]

    def save_quiz_to_db(self, quiz):
        quizzes_ref = self.db.collection('quizzes')
        quizzes_ref.add(quiz)

    def record_attempt(self, user_id, quiz_id, answers):
        attempt = {
            'user_id': user_id,
            'quiz_id': quiz_id,
            'answers': answers,
            'score': self.calculate_score(answers, quiz_id),
            'timestamp': firestore.SERVER_TIMESTAMP
        }
        attempts_ref = self.db.collection('quiz_attempts')
        attempts_ref.add(attempt)

    def calculate_score(self, answers, quiz_id):
        correct_answers = self.get_correct_answers(quiz_id)
        score = sum(1 for answer in answers if answer in correct_answers)
        return score

    def get_correct_answers(self, quiz_id):
        quiz_ref = self.db.collection('quizzes').document(quiz_id)
        quiz = quiz_ref.get()
        return [question['correct_answer'] for question in quiz.to_dict()['questions']]

    def analyze_performance(self, user_id):
        attempts_ref = self.db.collection('quiz_attempts').where('user_id', '==', user_id)
        attempts = attempts_ref.stream()
        performance_data = {
            'total_attempts': 0,
            'average_score': 0,
            'highest_score': 0
        }
        scores = []

        for attempt in attempts:
            data = attempt.to_dict()
            performance_data['total_attempts'] += 1
            scores.append(data['score'])
            performance_data['highest_score'] = max(performance_data['highest_score'], data['score'])

        if scores:
            performance_data['average_score'] = sum(scores) / len(scores)

        return performance_data

    def generate_adaptive_quiz(self, user_id):
        performance_data = self.analyze_performance(user_id)
        if performance_data['average_score'] < 50:
            difficulty_level = 'easy'
        elif performance_data['average_score'] < 75:
            difficulty_level = 'medium'
        else:
            difficulty_level = 'hard'

        topic = self.select_topic_based_on_performance(user_id)
        return self.generate_quiz(user_id, topic, difficulty_level)

    def select_topic_based_on_performance(self, user_id):
        # Logic to select topic based on user's past performance
        return random.choice(['Math', 'Science', 'History'])  # Placeholder logic

    def ai_tutor_conversation(self, user_id, message):
        # Logic for AI tutor conversation
        response = f"AI Tutor response to: {message}"
        return response

    def generate_reports(self, user_id):
        performance_data = self.analyze_performance(user_id)
        report = {
            'user_id': user_id,
            'performance_data': performance_data,
            'timestamp': firestore.SERVER_TIMESTAMP
        }
        reports_ref = self.db.collection('reports')
        reports_ref.add(report)
        return report