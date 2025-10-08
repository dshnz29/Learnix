import React, { useEffect, useState } from 'react';
import { getReports } from '../../../services/reportService';
import DetailedReport from '../../../components/reports/DetailedReport';
import PerformanceReport from '../../../components/reports/PerformanceReport';
import ProgressReport from '../../../components/reports/ProgressReport';

const ReportsPage = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await getReports();
        setReports(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) {
    return <div>Loading reports...</div>;
  }

  if (error) {
    return <div>Error fetching reports: {error}</div>;
  }

  return (
    <div>
      <h1>User Performance Reports</h1>
      {reports.map((report) => {
        switch (report.type) {
          case 'detailed':
            return <DetailedReport key={report.id} data={report.data} />;
          case 'performance':
            return <PerformanceReport key={report.id} data={report.data} />;
          case 'progress':
            return <ProgressReport key={report.id} data={report.data} />;
          default:
            return null;
        }
      })}
    </div>
  );
};

export default ReportsPage;