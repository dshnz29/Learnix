import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { getUserPerformance, getQuizAttempts } from '../../services/analyticsService';
import PerformanceChart from '../../components/analytics/PerformanceChart';
import ProgressTracker from '../../components/analytics/ProgressTracker';
import SkillRadar from '../../components/analytics/SkillRadar';

const DashboardPage = () => {
  const router = useRouter();
  const [performanceData, setPerformanceData] = useState(null);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const performance = await getUserPerformance();
        const attempts = await getQuizAttempts();
        setPerformanceData(performance);
        setQuizAttempts(attempts);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Dashboard</h1>
      {performanceData && (
        <>
          <PerformanceChart data={performanceData} />
          <ProgressTracker attempts={quizAttempts} />
          <SkillRadar skills={performanceData.skills} />
        </>
      )}
      <button onClick={() => router.push('/dashboard/analytics')}>View Analytics</button>
      <button onClick={() => router.push('/dashboard/reports')}>View Reports</button>
      <button onClick={() => router.push('/dashboard/tutor')}>Access AI Tutor</button>
      <button onClick={() => router.push('/dashboard/adaptive-quiz')}>Start Adaptive Quiz</button>
    </div>
  );
};

export default DashboardPage;