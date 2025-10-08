import React, { useEffect, useState } from 'react';
import { getDetailedReport } from '../../services/reportService';
import { useAuth } from '../../contexts/AuthContext';

const DetailedReport = () => {
  const { user } = useAuth();
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        const data = await getDetailedReport(user.id);
        setReportData(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchReportData();
    }
  }, [user]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Detailed Report</h1>
      {reportData ? (
        <div>
          <h2>User Performance</h2>
          <p>Total Quizzes Attempted: {reportData.totalAttempts}</p>
          <p>Average Score: {reportData.averageScore}</p>
          <h3>Quiz Attempts</h3>
          <ul>
            {reportData.attempts.map(attempt => (
              <li key={attempt.id}>
                Quiz ID: {attempt.quizId}, Score: {attempt.score}, Date: {attempt.date}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p>No report data available.</p>
      )}
    </div>
  );
};

export default DetailedReport;