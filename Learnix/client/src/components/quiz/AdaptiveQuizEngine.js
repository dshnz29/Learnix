import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { adaptiveQuizService } from '../../services/adaptiveQuizService';
import { attemptService } from '../../services/attemptService';
import { performanceCalculator } from '../../utils/performanceCalculator';

const AdaptiveQuizEngine = () => {
  const { id } = useParams();
  const [quizData, setQuizData] = useState(null);
  const [userResponses, setUserResponses] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [performanceMetrics, setPerformanceMetrics] = useState(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      const data = await adaptiveQuizService.getQuiz(id);
      setQuizData(data);
      setIsLoading(false);
    };
    fetchQuizData();
  }, [id]);

  const handleAnswer = async (answer) => {
    const updatedResponses = [...userResponses, answer];
    setUserResponses(updatedResponses);

    if (currentQuestionIndex < quizData.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      await recordAttempt(updatedResponses);
    }
  };

  const recordAttempt = async (responses) => {
    const attemptData = {
      quizId: id,
      responses,
      performance: performanceCalculator.calculate(responses, quizData),
    };
    await attemptService.recordAttempt(attemptData);
    setPerformanceMetrics(attemptData.performance);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>{quizData.title}</h1>
      <div>
        <h2>{quizData.questions[currentQuestionIndex].question}</h2>
        {quizData.questions[currentQuestionIndex].options.map((option, index) => (
          <button key={index} onClick={() => handleAnswer(option)}>
            {option}
          </button>
        ))}
      </div>
      {performanceMetrics && (
        <div>
          <h3>Your Performance:</h3>
          <p>Score: {performanceMetrics.score}</p>
          <p>Accuracy: {performanceMetrics.accuracy}%</p>
        </div>
      )}
    </div>
  );
};

export default AdaptiveQuizEngine;