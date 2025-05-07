const db = require('./db');

class Quiz {
  static async createQuiz({ title, subject, duration, question_count, questions }) {
    try {
      const result = await db.query(
        `INSERT INTO quizzes 
        (title, subject, duration, question_count, questions, created_at)
        VALUES (?, ?, ?, ?, ?, NOW())`,
        [title, subject, duration, question_count, questions]
      );
      
      return result.insertId;
    } catch (error) {
      console.error('Error creating quiz:', error);
      throw new Error('Failed to create quiz in database');
    }
  }
  
  static async getQuizById(id) {
    try {
      const [quiz] = await db.query(
        'SELECT * FROM quizzes WHERE id = ? LIMIT 1',
        [id]
      );
      return quiz;
    } catch (error) {
      console.error('Error fetching quiz:', error);
      throw new Error('Failed to fetch quiz from database');
    }
  }
}

module.exports = Quiz;