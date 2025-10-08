import React, { useEffect, useState } from 'react';
import { getAnalyticsData } from '../../../services/analyticsService';
import PerformanceChart from '../../../components/analytics/PerformanceChart';
import ProgressTracker from '../../../components/analytics/ProgressTracker';
import SkillRadar from '../../../components/analytics/SkillRadar';

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const data = await getAnalyticsData();
        setAnalyticsData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Analytics</h1>
      <PerformanceChart data={analyticsData.performance} />
      <ProgressTracker data={analyticsData.progress} />
      <SkillRadar data={analyticsData.skills} />
    </div>
  );
};

export default AnalyticsPage;