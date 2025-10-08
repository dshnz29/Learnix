'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, 
  Play, 
  Copy, 
  Check, 
  Settings, 
  Crown, 
  Trophy,
  Target,
  Clock,
  ArrowLeft
} from 'lucide-react';
import io from 'socket.io-client';
import Image from 'next/image';

// Import Firebase
import { db } from '../../../../lib/firebase';
import { doc, collection, onSnapshot, query, orderBy } from 'firebase/firestore';

const LobbyPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [isHost, setIsHost] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [socket, setSocket] = useState(null);
  const [realTimeParticipants, setRealTimeParticipants] = useState([]);
  
  const hasInitialized = useRef(false);

  // Real-time Firebase listener for participants
  useEffect(() => {
    if (!id) return;

    console.log('🔥 Setting up Firebase real-time listener for lobby:', id);

    // Listen to participants collection
    const participantsQuery = query(
      collection(db, 'lobbies', id, 'participants'),
      orderBy('joinedAt', 'asc')
    );

    const unsubscribe = onSnapshot(participantsQuery, (snapshot) => {
      const participantsList = [];
      snapshot.forEach((doc) => {
        participantsList.push({
          id: doc.id,
          ...doc.data()
        });
      });

      console.log('🔥 Firebase participants updated:', participantsList);
      setRealTimeParticipants(participantsList);
      
      // Update local participants as well
      setParticipants(participantsList);
    }, (error) => {
      console.error('❌ Firebase listener error:', error);
    });

    return () => {
      console.log('🧹 Cleaning up Firebase listener');
      unsubscribe();
    };
  }, [id]);

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!id || hasInitialized.current) return;
    hasInitialized.current = true;

    console.log('🔗 Attempting to connect to Socket.IO server...');

    const socketInstance = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    setSocket(socketInstance);

    // Socket event listeners
    socketInstance.on('connect', () => {
      console.log('✅ Connected to Socket.IO server:', socketInstance.id);
      initializeLobby(socketInstance);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket.IO connection error:', error);
      setError(`Connection failed: ${error.message}`);
      setLoading(false);
    });

    socketInstance.on('lobby-created', (data) => {
      console.log('✅ LOBBY-CREATED received:', data);
      setQuiz(data.lobby.quiz);
      setCurrentUser(data.currentUser);
      setIsHost(true);
      setLoading(false);
    });

    socketInstance.on('lobby-joined', (data) => {
      console.log('✅ LOBBY-JOINED received:', data);
      setQuiz(data.lobby.quiz);
      setCurrentUser(data.currentUser);
      setIsHost(data.currentUser.isHost);
      setLoading(false);
    });

    socketInstance.on('player-joined', (data) => {
      console.log('👋 PLAYER-JOINED received:', data);
      // Firebase will handle the real-time update
    });

    socketInstance.on('player-left', (data) => {
      console.log('👋 PLAYER-LEFT received:', data);
      // Firebase will handle the real-time update
    });

    socketInstance.on('player-disconnected', (data) => {
      console.log('🔌 PLAYER-DISCONNECTED received:', data);
      // Firebase will handle the real-time update
    });

    socketInstance.on('player-reconnected', (data) => {
      console.log('🔄 PLAYER-RECONNECTED received:', data);
      // Firebase will handle the real-time update
    });

    socketInstance.on('score-updated', (data) => {
      console.log('📊 SCORE-UPDATED received:', data);
      // Firebase will handle the real-time update
    });

    socketInstance.on('countdown', (data) => {
      setCountdown(data.countdown);
    });

    socketInstance.on('quiz-started', (data) => {
      setGameStarted(true);
      router.push(`/dashboard/quiz/${id}`);
    });

    socketInstance.on('join-error', (data) => {
      console.error('❌ JOIN-ERROR received:', data);
      setError(data.message);
      setLoading(false);
    });

    return () => {
      console.log('🧹 Cleaning up socket connection');
      socketInstance.disconnect();
    };
  }, [id]);

  // Host or player join logic
  const initializeLobby = useCallback((socketInstance) => {
    const storedQuiz = localStorage.getItem(`quiz_${id}`);
    const storedPlayer = localStorage.getItem(`player_${id}`);
    
    console.log('🔍 Initializing lobby...');
    console.log('Quiz data exists:', !!storedQuiz);
    console.log('Player data exists:', !!storedPlayer);
    
    if (storedQuiz) {
      // Host - has quiz data from create-quiz page
      const quizData = JSON.parse(storedQuiz);
      console.log('🏠 Creating lobby as host with data:', quizData);
      
      socketInstance.emit('create-lobby', {
        quizId: id,
        hostName: quizData.hostName || quizData.host || 'Quiz Host',
        hostAvatar: quizData.hostAvatar || quizData.selectedAvatar || 0,
        quizData: quizData
      });
    } else if (storedPlayer) {
      // Player - has player data from join form
      const playerData = JSON.parse(storedPlayer);
      console.log('👋 Joining lobby as player with data:', playerData);
      
      socketInstance.emit('join-lobby', {
        quizId: id,
        playerName: playerData.name,
        playerAvatar: playerData.avatar,
        playerId: playerData.id
      });
    } else {
      // No data - redirect to join form
      console.log('❌ No player or quiz data found, redirecting to join form');
      setLoading(false);
      router.push(`/dashboard/lobby/${id}/join`);
      return;
    }
  }, [id, router]);

  const copyInviteLink = useCallback(async () => {
    try {
      const link = `${window.location.origin}/dashboard/lobby/${id}/join`;
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  }, [id]);

  const toggleReady = useCallback(() => {
    if (!socket || !currentUser) return;
    
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    
    socket.emit('player-ready', {
      quizId: id,
      isReady: newReadyState
    });
  }, [socket, currentUser, isReady, id]);

  const startQuiz = useCallback(() => {
    if (!socket || !isHost) return;
    
    socket.emit('start-quiz', { quizId: id });
  }, [socket, isHost, id]);

  const leaveLobby = useCallback(() => {
    if (socket) {
      socket.emit('leave-lobby', { quizId: id });
    }
    
    // Clear localStorage
    localStorage.removeItem(`quiz_${id}`);
    localStorage.removeItem(`player_${id}`);
    
    router.push('/dashboard');
  }, [socket, id, router]);

  // Debug function
  const debugCurrentState = () => {
    console.log('=== LOBBY DEBUG STATE ===');
    console.log('Current Quiz ID:', id);
    console.log('Socket Connected:', socket?.connected);
    console.log('Socket ID:', socket?.id);
    console.log('Is Host:', isHost);
    console.log('Current User:', currentUser);
    console.log('Socket Participants:', participants);
    console.log('Firebase Participants:', realTimeParticipants);
    console.log('Participants Count:', participants.length);
    console.log('Real-time Count:', realTimeParticipants.length);
    
    const storedQuiz = localStorage.getItem(`quiz_${id}`);
    const storedPlayer = localStorage.getItem(`player_${id}`);
    console.log('Local Quiz Data:', storedQuiz ? JSON.parse(storedQuiz) : 'None');
    console.log('Local Player Data:', storedPlayer ? JSON.parse(storedPlayer) : 'None');
    console.log('========================');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-white">Loading lobby...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={leaveLobby}
            className="flex items-center px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition"
          >
            <ArrowLeft size={20} className="mr-2" />
            Leave Lobby
          </button>
          
          {process.env.NODE_ENV === 'development' && (
            <button
              onClick={debugCurrentState}
              className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm"
            >
              Debug State
            </button>
          )}

          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-2">
              {quiz?.title || 'Quiz Lobby'}
            </h1>
            <p className="text-white/60 text-sm">
              Lobby ID: {id?.slice(0, 8)}...
            </p>
          </div>

          <div className="flex items-center text-white">
            <Users size={20} className="mr-2" />
            <span>{realTimeParticipants.length} Players</span>
          </div>
        </div>

        {/* Countdown Overlay */}
        <AnimatePresence>
          {countdown !== null && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-6xl font-bold text-white"
              >
                {countdown === 0 ? 'START!' : countdown}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quiz Info */}
            {quiz && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">Quiz Details</h2>
                  <span className="px-3 py-1 bg-blue-500/30 rounded-full text-blue-200 text-sm">
                    {quiz.difficulty || 'Medium'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="bg-white/5 rounded-lg p-3">
                    <Target className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
                    <p className="text-white/60 text-xs mb-1">Questions</p>
                    <p className="text-white font-semibold">{quiz.questions?.length || 0}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <Clock className="w-6 h-6 text-green-400 mx-auto mb-2" />
                    <p className="text-white/60 text-xs mb-1">Duration</p>
                    <p className="text-white font-semibold">{quiz.duration || 15} min</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <Trophy className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                    <p className="text-white/60 text-xs mb-1">Subject</p>
                    <p className="text-white font-semibold">{quiz.subject || 'General'}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <Users className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                    <p className="text-white/60 text-xs mb-1">Players</p>
                    <p className="text-white font-semibold">{realTimeParticipants.length}</p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Participants List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Players ({realTimeParticipants.length})</h2>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm">Live</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence>
                  {realTimeParticipants.map((participant, index) => (
                    <motion.div
                      key={participant.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-4 rounded-lg border transition-all ${
                        participant.status === 'disconnected'
                          ? 'bg-red-500/10 border-red-400/30 opacity-60'
                          : participant.isHost
                          ? 'bg-yellow-500/10 border-yellow-400/30'
                          : participant.isReady
                          ? 'bg-green-500/10 border-green-400/30'
                          : 'bg-white/5 border-white/20'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Image
                            src={`/avatars/avatar${(participant.avatar || 0) + 1}.png`}
                            alt={participant.name}
                            width={48}
                            height={48}
                            className="rounded-full"
                          />
                          {participant.isHost && (
                            <Crown size={16} className="absolute -top-1 -right-1 text-yellow-400" />
                          )}
                          {participant.status === 'disconnected' && (
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white"></div>
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-white">
                              {participant.name}
                              {participant.id === currentUser?.id && ' (You)'}
                            </h3>
                            {participant.isHost && (
                              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-300 text-xs rounded">
                                Host
                              </span>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-sm text-white/60">
                              {participant.status === 'disconnected' 
                                ? 'Disconnected' 
                                : participant.isReady 
                                ? 'Ready' 
                                : 'Not Ready'
                              }
                            </p>
                            
                            {(participant.score !== undefined && participant.score > 0) && (
                              <div className="text-right">
                                <p className="text-sm font-semibold text-cyan-400">
                                  {participant.score} pts
                                </p>
                                <p className="text-xs text-white/50">
                                  {participant.correctAnswers || 0}✓ {participant.wrongAnswers || 0}✗
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {realTimeParticipants.length === 0 && (
                <div className="text-center py-8">
                  <Users size={48} className="text-white/30 mx-auto mb-4" />
                  <p className="text-white/50">No players yet...</p>
                  <p className="text-white/30 text-sm">Share the invite link to get started!</p>
                </div>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Share Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-lg font-bold text-white mb-4">Invite Players</h3>
              
              <div className="space-y-4">
                <div className="p-3 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-white/60 text-xs mb-2">Invite Link:</p>
                  <span className="font-mono font-bold text-white text-sm break-all">
                    {`${window.location.origin}/dashboard/lobby/${id}/join`}
                  </span>
                </div>
                
                <button
                  onClick={copyInviteLink}
                  className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-semibold transition"
                >
                  {linkCopied ? (
                    <>
                      <Check size={20} className="mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={20} className="mr-2" />
                      Copy Invite Link
                    </>
                  )}
                </button>
              </div>
            </motion.div>

            {/* Controls */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-lg font-bold text-white mb-4">Controls</h3>
              
              <div className="space-y-3">
                {!isHost && (
                  <button
                    onClick={toggleReady}
                    className={`w-full px-4 py-3 rounded-lg font-semibold transition ${
                      isReady
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                  >
                    {isReady ? 'Ready!' : 'Get Ready'}
                  </button>
                )}

                {isHost && (
                  <button
                    onClick={startQuiz}
                    disabled={realTimeParticipants.filter(p => p.status === 'active').length < 1}
                    className="w-full flex items-center justify-center px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition"
                  >
                    <Play size={20} className="mr-2" />
                    Start Quiz
                  </button>
                )}

                <button
                  onClick={leaveLobby}
                  className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 rounded-lg text-white font-semibold transition"
                >
                  Leave Lobby
                </button>
              </div>
            </motion.div>

            {/* Lobby Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20"
            >
              <h3 className="text-lg font-bold text-white mb-4">Lobby Stats</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Total Players:</span>
                  <span className="text-white font-semibold">{realTimeParticipants.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Active Players:</span>
                  <span className="text-green-400 font-semibold">
                    {realTimeParticipants.filter(p => p.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Ready Players:</span>
                  <span className="text-cyan-400 font-semibold">
                    {realTimeParticipants.filter(p => p.isReady && p.status === 'active').length}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-white/60">Disconnected:</span>
                  <span className="text-red-400 font-semibold">
                    {realTimeParticipants.filter(p => p.status === 'disconnected').length}
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
