import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { adaptiveQuizService } from '../../../services/adaptiveQuizService';
import { attemptService } from '../../../services/attemptService';
import AdaptiveQuizEngine from '../../../components/quiz/AdaptiveQuizEngine';
import PerformanceAnalysis from '../../../components/analytics/PerformanceChart';
import TutorSuggestions from '../../../components/tutor/TutorSuggestions';

const AdaptiveQuizPage = () => {
  const router = useRouter();
  const [quizData, setQuizData] = useState(null);
  const [userPerformance, setUserPerformance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuizData = async () => {
      try {
        const data = await adaptiveQuizService.getAdaptiveQuiz();
        setQuizData(data);
      } catch (err) {
        setError('Failed to load quiz data');
      } finally {
        setLoading(false);
      }
    };

    fetchQuizData();
  }, []);

  const handleQuizAttempt = async (attemptData) => {
    try {
      await attemptService.recordAttempt(attemptData);
      const performance = await attemptService.getUserPerformance();
      setUserPerformance(performance);
    } catch (err) {
      setError('Failed to record quiz attempt');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h1>Adaptive Quiz</h1>
      <AdaptiveQuizEngine quizData={quizData} onAttempt={handleQuizAttempt} />
      {userPerformance && <PerformanceAnalysis performanceData={userPerformance} />}
      <TutorSuggestions performanceData={userPerformance} />
    </div>
  );
};

export default AdaptiveQuizPage;