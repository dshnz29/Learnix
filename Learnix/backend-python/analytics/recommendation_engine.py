from google.cloud import firestore

class RecommendationEngine:
    def __init__(self):
        self.db = firestore.Client()

    def get_user_performance(self, user_id):
        user_ref = self.db.collection('users').document(user_id)
        user_data = user_ref.get()
        return user_data.to_dict() if user_data.exists else None

    def generate_recommendations(self, user_id):
        performance_data = self.get_user_performance(user_id)
        recommendations = []

        if performance_data:
            if performance_data['score'] < 50:
                recommendations.append("Consider reviewing the basics.")
            if performance_data['attempts'] > 5 and performance_data['score'] < 70:
                recommendations.append("Try taking a practice quiz.")
            if performance_data['last_attempt'] < 7:
                recommendations.append("You might benefit from a refresher course.")
        
        return recommendations

    def save_recommendations(self, user_id, recommendations):
        recommendations_ref = self.db.collection('recommendations').document(user_id)
        recommendations_ref.set({
            'recommendations': recommendations,
            'timestamp': firestore.SERVER_TIMESTAMP
        })

    def run(self, user_id):
        recommendations = self.generate_recommendations(user_id)
        self.save_recommendations(user_id, recommendations)
        return recommendations