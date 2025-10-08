class SinglePlayerService {
  constructor() {
    this.baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
    this.serverURL = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5000';
  }

  // Test server connection first
  async testServerConnection() {
    try {
      console.log('🔍 Testing server connection...');
      const response = await fetch(`${this.serverURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        console.error('❌ Server returned non-JSON response:', text);
        throw new Error('Server is running but not returning JSON. Check server configuration.');
      }

      const data = await response.json();
      console.log('✅ Server connection successful:', data);
      return true;
    } catch (error) {
      console.error('❌ Server connection failed:', error);
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        throw new Error('Cannot connect to backend server. Please ensure the server is running on http://localhost:5000');
      }
      
      throw error;
    }
  }

  // Helper method to handle API responses
  async handleResponse(response) {
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('❌ Non-JSON response received:', text.substring(0, 200) + '...');
      
      if (text.includes('<!DOCTYPE')) {
        throw new Error('Server returned HTML instead of JSON. The backend server may not be running or the route may not exist.');
      }
      
      throw new Error('Server returned invalid response format.');
    }

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return data;
  }

  // Get user quiz statistics with connection test
  async getUserQuizStats(userId) {
    try {
      // Test connection first
      await this.testServerConnection();
      
      console.log('📊 Getting user quiz stats for:', userId);
      
      const response = await fetch(`${this.baseURL}/singleplayer/stats/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await this.handleResponse(response);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get quiz stats');
      }

      console.log('✅ Quiz stats retrieved:', data.stats);
      return data.stats;
    } catch (error) {
      console.error('❌ Error getting quiz stats:', error);
      throw error;
    }
  }

  // Get user quiz history with connection test
  async getUserQuizHistory(userId, limit = 20) {
    try {
      // Test connection first
      await this.testServerConnection();
      
      console.log('📚 Getting user quiz history for:', userId);
      
      const response = await fetch(`${this.baseURL}/singleplayer/history/${userId}?limit=${limit}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await this.handleResponse(response);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get quiz history');
      }

      console.log('✅ Quiz history retrieved:', data.quizzes.length, 'quizzes');
      return data;
    } catch (error) {
      console.error('❌ Error getting quiz history:', error);
      throw error;
    }
  }

  // Create single player quiz
  async createSinglePlayerQuiz(quizData) {
    try {
      await this.testServerConnection();
      
      console.log('📤 Creating single player quiz:', quizData.id);
      
      const response = await fetch(`${this.baseURL}/singleplayer/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(quizData)
      });

      const data = await this.handleResponse(response);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to create single player quiz');
      }

      console.log('✅ Single player quiz created successfully');
      return data;
    } catch (error) {
      console.error('❌ Error creating single player quiz:', error);
      throw error;
    }
  }

  // Get quiz by ID
  async getQuizById(quizId) {
    try {
      await this.testServerConnection();
      
      const response = await fetch(`${this.baseURL}/singleplayer/quiz/${quizId}`);
      const data = await this.handleResponse(response);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to get quiz');
      }

      return data.quiz;
    } catch (error) {
      console.error('❌ Error getting quiz:', error);
      throw error;
    }
  }

  // Update quiz progress
  async updateQuizProgress(quizId, progressData) {
    try {
      await this.testServerConnection();
      
      const response = await fetch(`${this.baseURL}/singleplayer/quiz/${quizId}/progress`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(progressData)
      });

      const data = await this.handleResponse(response);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to update progress');
      }

      return data;
    } catch (error) {
      console.error('❌ Error updating progress:', error);
      throw error;
    }
  }

  // Complete quiz
  async completeQuiz(quizId, results) {
    try {
      await this.testServerConnection();
      
      const response = await fetch(`${this.baseURL}/singleplayer/quiz/${quizId}/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(results)
      });

      const data = await this.handleResponse(response);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to complete quiz');
      }

      return data;
    } catch (error) {
      console.error('❌ Error completing quiz:', error);
      throw error;
    }
  }

  // Retry quiz
  async retryQuiz(quizId, userId, playerData = {}) {
    try {
      await this.testServerConnection();
      
      const response = await fetch(`${this.baseURL}/singleplayer/retry/${quizId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId, playerData })
      });

      const data = await this.handleResponse(response);
      
      if (!data.success) {
        throw new Error(data.error || 'Failed to retry quiz');
      }

      return data;
    } catch (error) {
      console.error('❌ Error retrying quiz:', error);
      throw error;
    }
  }
}

export default new SinglePlayerService();