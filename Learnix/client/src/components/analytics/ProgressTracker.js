import React, { useEffect, useState } from 'react';
import { getUserProgress } from '../../services/analyticsService';
import ProgressBar from 'react-bootstrap/ProgressBar';

const ProgressTracker = () => {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProgressData = async () => {
      try {
        const data = await getUserProgress();
        setProgressData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h2>User Progress Tracker</h2>
      {progressData.map((item, index) => (
        <div key={index}>
          <h4>{item.quizTitle}</h4>
          <ProgressBar now={item.progressPercentage} label={`${item.progressPercentage}%`} />
        </div>
      ))}
    </div>
  );
};

export default ProgressTracker;