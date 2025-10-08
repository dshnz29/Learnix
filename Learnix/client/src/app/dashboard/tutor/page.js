import React, { useEffect, useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { tutorService } from '../../../services/tutorService';
import ChatInterface from '../../../components/tutor/ChatInterface';
import ConversationHistory from '../../../components/tutor/ConversationHistory';
import TutorSuggestions from '../../../components/tutor/TutorSuggestions';

const TutorPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await tutorService.getConversations(user.id);
        setConversations(data);
      } catch (error) {
        console.error("Error fetching conversations:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchSuggestions = async () => {
      try {
        const data = await tutorService.getSuggestions(user.id);
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      }
    };

    fetchConversations();
    fetchSuggestions();
  }, [user.id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>AI Tutor</h1>
      <ChatInterface />
      <ConversationHistory conversations={conversations} />
      <TutorSuggestions suggestions={suggestions} />
    </div>
  );
};

export default TutorPage;