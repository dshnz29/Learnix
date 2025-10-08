import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getQuizById, recordQuizAttempt } from '../../../services/attemptService';
import QuizInterface from '../../../components/quiz/QuizInterface';
import LoadingSpinner from '../../../components/LoadingSpinner';
import ErrorMessage from '../../../components/ErrorMessage';

const QuizPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAnswers, setUserAnswers] = useState([]);

  useEffect(() => {
    if (id) {
      getQuizById(id)
        .then((data) => {
          setQuiz(data);
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [id]);

  const handleAnswerSubmit = async (answers) => {
    setUserAnswers(answers);
    try {
      await recordQuizAttempt(id, answers);
      router.push(`/quiz/results/${id}`);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div>
      <h1>{quiz.title}</h1>
      <QuizInterface quiz={quiz} onSubmit={handleAnswerSubmit} />
    </div>
  );
};

export default QuizPage;