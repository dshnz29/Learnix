import React, { useEffect, useState } from 'react';
import { getProgressReport } from '../../services/reportService';

const ProgressReport = () => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const data = await getProgressReport();
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
      <h1>Progress Report</h1>
      {reportData ? (
        <div>
          <h2>User Progress Overview</h2>
          <ul>
            {reportData.map((item, index) => (
              <li key={index}>
                <strong>{item.quizTitle}</strong>: {item.progress}%
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>No progress data available.</div>
      )}
    </div>
  );
};

export default ProgressReport;