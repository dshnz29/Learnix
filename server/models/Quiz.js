const db = require('./db');

exports.saveQuiz = async (title, questions) => {
  const [result] = await db.execute(
    'INSERT INTO quizzes (title, questions) VALUES (?, ?)',
    [title, questions]
  );
  return result.insertId;
};

exports.getQuizById = async (id) => {
  const [rows] = await db.execute(
    'SELECT * FROM quizzes WHERE id = ?',
    [id]
  );
  return rows[0];
};
