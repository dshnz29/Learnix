import React from 'react';
import { Radar } from 'react-chartjs-2';
import { useEffect, useState } from 'react';
import { fetchUserSkills } from '../../services/analyticsService';

const SkillRadar = ({ userId }) => {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getUserSkills = async () => {
      try {
        const skills = await fetchUserSkills(userId);
        const skillLabels = Object.keys(skills);
        const skillValues = Object.values(skills);

        setData({
          labels: skillLabels,
          datasets: [
            {
              label: 'Skill Levels',
              data: skillValues,
              backgroundColor: 'rgba(255, 99, 132, 0.2)',
              borderColor: 'rgba(255, 99, 132, 1)',
              borderWidth: 1,
            },
          ],
        });
      } catch (error) {
        console.error('Error fetching user skills:', error);
      } finally {
        setLoading(false);
      }
    };

    getUserSkills();
  }, [userId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h2>User Skill Radar</h2>
      <Radar data={data} />
    </div>
  );
};

export default SkillRadar;