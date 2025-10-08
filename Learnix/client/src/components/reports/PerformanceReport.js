import React, { useEffect, useState } from 'react';
import { getPerformanceReport } from '../../services/reportService';
import PerformanceChart from '../analytics/PerformanceChart';
import ProgressTracker from '../analytics/ProgressTracker';

const PerformanceReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const data = await getPerformanceReport();
        setReportData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Performance Report</h1>
      <PerformanceChart data={reportData.performanceData} />
      <ProgressTracker data={reportData.progressData} />
    </div>
  );
};

export default PerformanceReport;