from flask import Flask, request, jsonify
from flask_cors import CORS
from ai_services.tutor_ai import TutorAI
from ai_services.quiz_generator import QuizGenerator
from analytics.learning_analytics import LearningAnalytics
from models.quiz_models import QuizAttempt
from models.user_models import UserProgress
from models.analytics_models import LearningAnalytics as AnalyticsModel
from firebase_admin import firestore

app = Flask(__name__)
CORS(app)

# Initialize Firestore
db = firestore.client()

# Initialize services
tutor_ai = TutorAI()
quiz_generator = QuizGenerator()
learning_analytics = LearningAnalytics()

@app.route('/api/quiz/attempt', methods=['POST'])
def record_quiz_attempt():
    data = request.json
    attempt = QuizAttempt(data['userId'], data['quizId'], data['answers'], data['score'])
    db.collection('quiz_attempts').add(attempt.to_dict())
    return jsonify({'message': 'Quiz attempt recorded successfully'}), 201

@app.route('/api/analytics/performance/<user_id>', methods=['GET'])
def get_performance_analysis(user_id):
    performance_data = learning_analytics.analyze_performance(user_id)
    return jsonify(performance_data), 200

@app.route('/api/tutor/conversation', methods=['POST'])
def ai_tutor_conversation():
    user_input = request.json.get('message')
    response = tutor_ai.generate_response(user_input)
    return jsonify({'response': response}), 200

@app.route('/api/analytics/reports/<user_id>', methods=['GET'])
def get_user_reports(user_id):
    reports = learning_analytics.generate_reports(user_id)
    return jsonify(reports), 200

@app.route('/api/quiz/adaptive', methods=['POST'])
def generate_adaptive_quiz():
    user_id = request.json.get('userId')
    adaptive_quiz = quiz_generator.generate_adaptive_quiz(user_id)
    return jsonify(adaptive_quiz), 200

if __name__ == '__main__':
    app.run(debug=True)