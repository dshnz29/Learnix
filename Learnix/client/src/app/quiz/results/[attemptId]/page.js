import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getQuizAttempt } from '../../../services/attemptService';
import PerformanceAnalysis from '../../../components/analytics/PerformanceChart';
import DetailedReport from '../../../components/reports/DetailedReport';

const QuizResultsPage = () => {
  const router = useRouter();
  const { attemptId } = router.query;
  const [attemptData, setAttemptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (attemptId) {
      const fetchAttemptData = async () => {
        try {
          const data = await getQuizAttempt(attemptId);
          setAttemptData(data);
        } catch (err) {
          setError('Failed to load attempt data');
        } finally {
          setLoading(false);
        }
      };

      fetchAttemptData();
    }
  }, [attemptId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h1>Quiz Attempt Results</h1>
      <PerformanceAnalysis data={attemptData.performance} />
      <DetailedReport reportData={attemptData.report} />
    </div>
  );
};

export default QuizResultsPage;