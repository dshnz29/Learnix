import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import { fetchPerformanceData } from '../../services/analyticsService';

const PerformanceChart = () => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getPerformanceData = async () => {
      try {
        const data = await fetchPerformanceData();
        setChartData({
          labels: data.map(item => item.date),
          datasets: [
            {
              label: 'Performance Over Time',
              data: data.map(item => item.score),
              borderColor: 'rgba(75,192,192,1)',
              backgroundColor: 'rgba(75,192,192,0.2)',
              fill: true,
            },
          ],
        });
      } catch (err) {
        setError('Failed to fetch performance data');
      } finally {
        setLoading(false);
      }
    };

    getPerformanceData();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Performance Chart</h2>
      <Line data={chartData} />
    </div>
  );
};

export default PerformanceChart;