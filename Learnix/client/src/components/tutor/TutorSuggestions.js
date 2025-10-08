import React, { useEffect, useState } from 'react';
import { getTutorSuggestions } from '../../services/tutorService';

const TutorSuggestions = () => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const data = await getTutorSuggestions();
        setSuggestions(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  if (loading) {
    return <div>Loading suggestions...</div>;
  }

  if (error) {
    return <div>Error fetching suggestions: {error}</div>;
  }

  return (
    <div>
      <h2>Tutor Suggestions</h2>
      <ul>
        {suggestions.map((suggestion, index) => (
          <li key={index}>{suggestion}</li>
        ))}
      </ul>
    </div>
  );
};

export default TutorSuggestions;