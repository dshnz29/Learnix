'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
// ✅ Fixed import - using correct icon names
import { FaHistory, FaTrophy, FaClock, FaBullseye, FaRedo, FaEye, FaChartLine } from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';
import singlePlayerService from '../../../services/singlePlayerService';

export default function HistoryPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  // State variables
  const [quizHistory, setQuizHistory] = useState([]);
  const [quizStats, setQuizStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryingQuiz, setRetryingQuiz] = useState(null);
  const [serverStatus, setServerStatus] = useState('unknown');
  const [filterStatus, setFilterStatus] = useState('all'); // all, completed, in_progress

  // Fetch quiz history and stats
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.uid) return;

      try {
        setLoading(true);
        setError(null);
        setServerStatus('connecting');
        
        console.log('🔍 Fetching data for user:', user.uid);
        
        // Fetch history and stats in parallel
        const [historyResult, statsResult] = await Promise.all([
          singlePlayerService.getUserQuizHistory(user.uid, 50),
          singlePlayerService.getUserQuizStats(user.uid)
        ]);

        setQuizHistory(historyResult.quizzes || []);
        setQuizStats(statsResult);
        setServerStatus('connected');
        
        console.log('✅ Data fetched successfully');
        console.log('📊 History:', historyResult.quizzes?.length || 0, 'quizzes');
        console.log('📈 Stats:', statsResult);
        
      } catch (err) {
        console.error('❌ Error fetching history:', err);
        setServerStatus('disconnected');
        
        let errorMessage = err.message;
        
        if (err.message.includes('Cannot connect to backend server')) {
          errorMessage = `Backend server is not running. Please:
          1. Open terminal in backend-node folder
          2. Run: npm install (if first time)
          3. Run: npm start
          4. Refresh this page
          
          Server should be running on http://localhost:5000`;
        } else if (err.message.includes('HTML instead of JSON')) {
          errorMessage = `Backend server route issue. Please:
          1. Check server logs for errors
          2. Ensure routes/singlePlayer.js exists
          3. Restart the server: npm start`;
        } else if (err.message.includes('index')) {
          errorMessage = `Database index required. The query is working with fallback method, but you may want to create an index for better performance.`;
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  // Handle quiz retry
  const handleRetryQuiz = async (quiz) => {
    try {
      setRetryingQuiz(quiz.id);
      console.log('🔄 Retrying quiz:', quiz.id);
      
      const retryResult = await singlePlayerService.retryQuiz(
        quiz.id, 
        user.uid, 
        {
          playerName: user.displayName || 'Anonymous',
          playerAvatar: 1
        }
      );
      
      if (retryResult.success) {
        console.log('✅ Quiz retry created:', retryResult.quizId);
        router.push(`/dashboard/quiz/${retryResult.quizId}/play`);
      }
    } catch (error) {
      console.error('❌ Error retrying quiz:', error);
      setError(`Failed to retry quiz: ${error.message}`);
    } finally {
      setRetryingQuiz(null);
    }
  };

  // Handle view quiz
  const handleViewQuiz = (quiz) => {
    if (quiz.status === 'completed') {
      router.push(`/dashboard/quiz/${quiz.id}/results`);
    } else {
      router.push(`/dashboard/quiz/${quiz.id}/play`);
    }
  };

  // Filter quizzes based on status
  const filteredQuizzes = quizHistory.filter(quiz => {
    if (filterStatus === 'all') return true;
    return quiz.status === filterStatus;
  });

  // Format date
  const formatDate = (date) => {
    if (!date) return 'Unknown';
    const d = new Date(date);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '0s';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-500/20 text-green-400 border-green-400/30';
      case 'in_progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-400/30';
    }
  };

  // Server Status Component
  const ServerStatus = () => {
    if (serverStatus === 'connected') {
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-green-500/20 border border-green-400/30 rounded-lg text-green-400 text-sm"
        >
          ✅ Server connected - Data loaded successfully
        </motion.div>
      );
    } else if (serverStatus === 'disconnected') {
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-4 bg-red-500/20 border border-red-400/30 rounded-lg"
        >
          <div className="text-red-400 font-medium mb-2">❌ Server Connection Failed</div>
          <div className="text-red-300 text-sm">
            The backend server is not running. Please:
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Open terminal in backend-node folder</li>
              <li>Run <code className="bg-black/30 px-1 rounded">npm start</code></li>
              <li>Refresh this page</li>
            </ol>
          </div>
        </motion.div>
      );
    } else if (serverStatus === 'connecting') {
      return (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4 p-3 bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-400 text-sm"
        >
          🔄 Connecting to server...
        </motion.div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="min-h-screen  flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#18DEA3] mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading your quiz history...</p>
          <p className="text-white/60 text-sm mt-2">Fetching data from server...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <FaHistory className="text-[#18DEA3]" />
            Quiz History
          </h1>
          <p className="text-white/70">Track your learning progress and retry your favorite quizzes</p>
        </motion.div>

        {/* Server Status */}
        <ServerStatus />

        {/* Error Message */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="mb-6 p-4 bg-red-500/20 border border-red-400/30 rounded-lg text-red-400"
            >
              <div className="font-medium mb-2">⚠️ Error Loading History</div>
              <div className="text-sm whitespace-pre-line">{error}</div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Overview */}
        {quizStats && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-[#18DEA3]">{quizStats.totalQuizzes}</div>
                  <div className="text-white/60 text-sm">Total Quizzes</div>
                </div>
                <FaChartLine className="text-[#18DEA3] text-2xl" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-green-400">{quizStats.completedQuizzes}</div>
                  <div className="text-white/60 text-sm">Completed</div>
                </div>
                <FaTrophy className="text-green-400 text-2xl" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-blue-400">{quizStats.averageScore}%</div>
                  <div className="text-white/60 text-sm">Average Score</div>
                </div>
                <FaBullseye className="text-blue-400 text-2xl" />
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold text-purple-400">{quizStats.accuracy}%</div>
                  <div className="text-white/60 text-sm">Accuracy</div>
                </div>
                <FaChartLine className="text-purple-400 text-2xl" />
              </div>
            </div>
          </motion.div>
        )}

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex space-x-4">
            {[
              { key: 'all', label: 'All Quizzes', count: quizHistory.length },
              { key: 'completed', label: 'Completed', count: quizHistory.filter(q => q.status === 'completed').length },
              { key: 'in_progress', label: 'In Progress', count: quizHistory.filter(q => q.status === 'in_progress').length }
            ].map((filter) => (
              <button
                key={filter.key}
                onClick={() => setFilterStatus(filter.key)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filterStatus === filter.key
                    ? 'bg-[#18DEA3] text-white'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                {filter.label} ({filter.count})
              </button>
            ))}
          </div>
        </motion.div>

        {/* Quiz History List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {filteredQuizzes.length === 0 ? (
            <div className="text-center py-12 bg-white/5 backdrop-blur-md rounded-xl border border-white/20">
              <FaHistory className="text-6xl text-white/30 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {filterStatus === 'all' ? 'No quizzes yet' : `No ${filterStatus.replace('_', ' ')} quizzes`}
              </h3>
              <p className="text-white/60 mb-6">
                {filterStatus === 'all' 
                  ? 'Start your learning journey by creating your first quiz!'
                  : `You don't have any ${filterStatus.replace('_', ' ')} quizzes yet.`
                }
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => router.push('/dashboard/create-quiz')}
                className="px-6 py-3 bg-gradient-to-r from-[#18DEA3] to-[#422cac] rounded-lg text-white font-semibold"
              >
                Create Your First Quiz
              </motion.button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredQuizzes.map((quiz, index) => (
                <motion.div
                  key={quiz.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-white mb-2">{quiz.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-white/60">
                        <span>📚 {quiz.subject}</span>
                        <span>❓ {quiz.questionCount} questions</span>
                        <span>⏱️ {quiz.duration}min</span>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(quiz.status)}`}>
                      {quiz.status === 'completed' ? 'Completed' : 'In Progress'}
                    </div>
                  </div>

                  {quiz.status === 'completed' && quiz.results && (
                    <div className="grid grid-cols-3 gap-4 mb-4 p-3 bg-white/5 rounded-lg">
                      <div className="text-center">
                        <div className="text-lg font-bold text-[#18DEA3]">{quiz.results.score || quiz.score}%</div>
                        <div className="text-xs text-white/60">Score</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-400">
                          {quiz.results.correctAnswers || quiz.correctAnswers}/{quiz.questionCount}
                        </div>
                        <div className="text-xs text-white/60">Correct</div>
                      </div>
                      <div className="text-center">
                        <div className="text-lg font-bold text-purple-400">
                          {formatDuration(quiz.results.timeSpent || quiz.timeSpent)}
                        </div>
                        <div className="text-xs text-white/60">Time</div>
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-white/50 mb-4">
                    Created: {formatDate(quiz.createdAt)}
                    {quiz.completedAt && (
                      <span className="ml-2">• Completed: {formatDate(quiz.completedAt)}</span>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleViewQuiz(quiz)}
                      className="flex-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm font-medium hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                    >
                      <FaEye />
                      {quiz.status === 'completed' ? 'View Results' : 'Continue'}
                    </motion.button>
                    
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleRetryQuiz(quiz)}
                      disabled={retryingQuiz === quiz.id}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-[#18DEA3] to-[#422cac] rounded-lg text-white text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {retryingQuiz === quiz.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white/30 border-t-white"></div>
                          Retrying...
                        </>
                      ) : (
                        <>
                          <FaRedo />
                          Retry Quiz
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}