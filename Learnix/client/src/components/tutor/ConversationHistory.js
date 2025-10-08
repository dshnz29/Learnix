import React, { useEffect, useState } from 'react';
import { getConversationHistory } from '../../services/tutorService';

const ConversationHistory = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversationHistory();
        setConversations(data);
      } catch (err) {
        setError('Failed to load conversation history');
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <h2>Conversation History</h2>
      <ul>
        {conversations.map((conversation, index) => (
          <li key={index}>
            <strong>{conversation.date}</strong>: {conversation.message}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationHistory;