import React, { useEffect, useState } from 'react';
import { firestore } from '../../lib/firebase'; // Adjust the import based on your Firebase setup
import { useParams } from 'react-router-dom';

const QuestionAnalyzer = () => {
  const { quizId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [userResponses, setUserResponses] = useState([]);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      const questionsSnapshot = await firestore.collection('quizzes').doc(quizId).collection('questions').get();
      const questionsData = questionsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQuestions(questionsData);
    };

    fetchQuestions();
  }, [quizId]);

  const analyzeResponses = () => {
    // Logic to analyze user responses against questions
    const correctAnswers = questions.filter((question, index) => question.correctAnswer === userResponses[index]);
    const performance = (correctAnswers.length / questions.length) * 100;
    setAnalysis({ correctAnswers: correctAnswers.length, totalQuestions: questions.length, performance });
  };

  const handleResponseChange = (index, response) => {
    const updatedResponses = [...userResponses];
    updatedResponses[index] = response;
    setUserResponses(updatedResponses);
  };

  return (
    <div>
      <h2>Question Analyzer</h2>
      {questions.map((question, index) => (
        <div key={question.id}>
          <p>{question.text}</p>
          <input
            type="text"
            onChange={(e) => handleResponseChange(index, e.target.value)}
            placeholder="Your answer"
          />
        </div>
      ))}
      <button onClick={analyzeResponses}>Analyze Responses</button>
      {analysis && (
        <div>
          <h3>Analysis Results</h3>
          <p>Correct Answers: {analysis.correctAnswers}</p>
          <p>Total Questions: {analysis.totalQuestions}</p>
          <p>Performance: {analysis.performance}%</p>
        </div>
      )}
    </div>
  );
};

export default QuestionAnalyzer;