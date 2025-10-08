import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getQuizAttempt } from '../../services/attemptService';
import PerformanceChart from '../analytics/PerformanceChart';
import ProgressTracker from '../analytics/ProgressTracker';
import SkillRadar from '../analytics/SkillRadar';

const ResultsAnalysis = () => {
  const { attemptId } = useParams();
  const [attemptData, setAttemptData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAttemptData = async () => {
      try {
        const data = await getQuizAttempt(attemptId);
        setAttemptData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAttemptData();
  }, [attemptId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Results Analysis</h1>
      <h2>Performance Overview</h2>
      <PerformanceChart data={attemptData.performanceData} />
      <h2>Progress Tracker</h2>
      <ProgressTracker progress={attemptData.progress} />
      <h2>Skill Analysis</h2>
      <SkillRadar skills={attemptData.skills} />
    </div>
  );
};

export default ResultsAnalysis;