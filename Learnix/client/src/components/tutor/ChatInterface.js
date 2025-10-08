import React, { useState, useEffect } from 'react';
import { sendMessageToTutor, fetchConversationHistory } from '../../services/tutorService';

const ChatInterface = () => {
  const [message, setMessage] = useState('');
  const [conversation, setConversation] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadConversationHistory = async () => {
      const history = await fetchConversationHistory();
      setConversation(history);
      setLoading(false);
    };

    loadConversationHistory();
  }, []);

  const handleSendMessage = async () => {
    if (message.trim()) {
      const response = await sendMessageToTutor(message);
      setConversation((prev) => [...prev, { user: message, tutor: response }]);
      setMessage('');
    }
  };

  return (
    <div className="chat-interface">
      <h2>Chat with AI Tutor</h2>
      <div className="conversation-history">
        {loading ? (
          <p>Loading conversation...</p>
        ) : (
          conversation.map((entry, index) => (
            <div key={index} className="chat-entry">
              <div className="user-message">{entry.user}</div>
              <div className="tutor-message">{entry.tutor}</div>
            </div>
          ))
        )}
      </div>
      <div className="message-input">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your message..."
        />
        <button onClick={handleSendMessage}>Send</button>
      </div>
    </div>
  );
};

export default ChatInterface;