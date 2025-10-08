from google.cloud import firestore

class PerformanceAnalyzer:
    def __init__(self):
        self.db = firestore.Client()

    def record_quiz_attempt(self, user_id, quiz_id, score, total_questions, attempt_time):
        attempt_data = {
            'user_id': user_id,
            'quiz_id': quiz_id,
            'score': score,
            'total_questions': total_questions,
            'attempt_time': attempt_time,
            'timestamp': firestore.SERVER_TIMESTAMP
        }
        self.db.collection('quiz_attempts').add(attempt_data)

    def analyze_performance(self, user_id):
        attempts_ref = self.db.collection('quiz_attempts').where('user_id', '==', user_id)
        attempts = attempts_ref.stream()

        total_score = 0
        total_attempts = 0
        for attempt in attempts:
            total_score += attempt.to_dict()['score']
            total_attempts += 1

        average_score = total_score / total_attempts if total_attempts > 0 else 0
        return {
            'average_score': average_score,
            'total_attempts': total_attempts
        }

    def generate_report(self, user_id):
        performance_data = self.analyze_performance(user_id)
        report = {
            'user_id': user_id,
            'average_score': performance_data['average_score'],
            'total_attempts': performance_data['total_attempts']
        }
        return report

    def adaptive_quiz_generation(self, user_id):
        performance_data = self.analyze_performance(user_id)
        if performance_data['average_score'] < 50:
            return "Generate easier quiz"
        elif performance_data['average_score'] > 80:
            return "Generate harder quiz"
        else:
            return "Maintain current difficulty level"