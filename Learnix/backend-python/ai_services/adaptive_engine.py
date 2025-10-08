from google.cloud import firestore

class AdaptiveQuizEngine:
    def __init__(self):
        self.db = firestore.Client()

    def record_quiz_attempt(self, user_id, quiz_id, score, questions_answered):
        attempt_data = {
            'user_id': user_id,
            'quiz_id': quiz_id,
            'score': score,
            'questions_answered': questions_answered,
            'timestamp': firestore.SERVER_TIMESTAMP
        }
        self.db.collection('quiz_attempts').add(attempt_data)

    def analyze_performance(self, user_id):
        attempts_ref = self.db.collection('quiz_attempts').where('user_id', '==', user_id)
        attempts = attempts_ref.stream()

        total_score = 0
        total_attempts = 0
        for attempt in attempts:
            total_score += attempt.to_dict().get('score', 0)
            total_attempts += 1

        average_score = total_score / total_attempts if total_attempts > 0 else 0
        return {
            'average_score': average_score,
            'total_attempts': total_attempts
        }

    def generate_adaptive_quiz(self, user_id):
        performance_data = self.analyze_performance(user_id)
        average_score = performance_data['average_score']

        if average_score < 50:
            difficulty_level = 'easy'
        elif average_score < 75:
            difficulty_level = 'medium'
        else:
            difficulty_level = 'hard'

        quiz_ref = self.db.collection('quizzes').where('difficulty', '==', difficulty_level)
        quizzes = quiz_ref.stream()

        return [quiz.to_dict() for quiz in quizzes]

    def ai_tutor_conversation(self, user_id, message):
        # Placeholder for AI tutor logic
        response = f"AI Tutor response to '{message}' from user {user_id}"
        return response

    def generate_report(self, user_id):
        performance_data = self.analyze_performance(user_id)
        report = {
            'user_id': user_id,
            'average_score': performance_data['average_score'],
            'total_attempts': performance_data['total_attempts']
        }
        return report