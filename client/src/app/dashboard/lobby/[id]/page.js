'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserIcon,
  ClockIcon,
  TagIcon,
  ShareIcon,
  CopyIcon,
  UsersIcon,
  ArrowLeft,
  CheckCircle,
} from 'lucide-react';
import { FaCrown, FaSpinner } from 'react-icons/fa';
import Image from 'next/image';
import { io } from 'socket.io-client';

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

  const hasInitialized = useRef(false);

  const avatars = [
    { src: '/avatars/avatar1.png', id: 0 },
    { src: '/avatars/avatar2.png', id: 1 },
    { src: '/avatars/avatar3.png', id: 2 },
  ];

  // Initialize Socket.IO connection
  useEffect(() => {
    if (!id || hasInitialized.current) return;
    hasInitialized.current = true;

    const socketInstance = io('http://localhost:5000', {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(socketInstance);

    // Socket event listeners
    socketInstance.on('connect', () => {
      initializeLobby(socketInstance);
    });

    socketInstance.on('disconnect', () => {
      setError('Disconnected from server');
    });

    socketInstance.on('lobby-created', (data) => {
      setQuiz(data.lobby.quiz);
      setCurrentUser(data.currentUser);
      setParticipants(data.lobby.participants);
      setIsHost(true);
      setLoading(false);
    });

    socketInstance.on('lobby-joined', (data) => {
      setQuiz(data.lobby.quiz);
      setCurrentUser(data.currentUser);
      setParticipants(data.lobby.participants);
      setIsHost(data.currentUser.isHost);
      setLoading(false);
    });

    socketInstance.on('player-joined', (data) => {
      setParticipants(data.participants);
    });

    socketInstance.on('player-left', (data) => {
      setParticipants(data.participants);
    });

    socketInstance.on('new-host', (data) => {
      setParticipants(data.participants);
      if (data.newHost.socketId === socketInstance.id) {
        setIsHost(true);
        setCurrentUser(prev => ({ ...prev, isHost: true }));
      }
    });

    socketInstance.on('player-ready-updated', (data) => {
      setParticipants(data.participants);
    });

    socketInstance.on('countdown', (data) => {
      setCountdown(data.countdown);
      setGameStarted(true);
    });

    socketInstance.on('quiz-started', (data) => {
      if (currentUser) {
        localStorage.setItem(`player_${id}`, JSON.stringify(currentUser));
      }
      router.push(`/dashboard/quiz/${id}`);
    });

    socketInstance.on('join-error', (data) => {
      setError(data.message);
      setLoading(false);
    });

    socketInstance.on('start-error', (data) => {
      setError(data.message);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [id]);

  // Host or player join logic
  const initializeLobby = useCallback((socketInstance) => {
    const storedQuiz = localStorage.getItem(`quiz_${id}`);
    if (storedQuiz) {
      // Host
      const quizData = JSON.parse(storedQuiz);
      socketInstance.emit('create-lobby', {
        quizId: id,
        hostName: quizData.hostName || 'Quiz Host',
        hostAvatar: quizData.hostAvatar || 0,
        quizData: quizData
      });
    } else {
      // Player
      const playerName = prompt('Enter your name:') || `Player ${Math.floor(Math.random() * 1000)}`;
      socketInstance.emit('join-lobby', {
        quizId: id,
        playerName: playerName,
        playerAvatar: Math.floor(Math.random() * 3)
      });
    }
  }, [id]);

  const handleStartQuiz = useCallback(() => {
    if (!socket || !isHost || gameStarted) return;
    if (participants.length < 1) {
      setError('Need at least 1 participant to start');
      return;
    }
    socket.emit('start-quiz', { quizId: id });
  }, [socket, isHost, gameStarted, participants.length, id]);

  const handleReadyToggle = useCallback(() => {
    if (!socket) return;
    const newReadyState = !isReady;
    setIsReady(newReadyState);
    socket.emit('player-ready', {
      quizId: id,
      isReady: newReadyState
    });
  }, [socket, isReady, id]);

  const copyInviteLink = useCallback(async () => {
    try {
      const link = `${window.location.origin}/dashboard/lobby/${id}`;
      await navigator.clipboard.writeText(link);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  }, [id]);

  const leaveLobby = useCallback(() => {
    if (socket) {
      socket.emit('leave-lobby', { quizId: id });
      socket.disconnect();
    }
    localStorage.removeItem(`quiz_${id}`);
    localStorage.removeItem(`quiz_${id}_state`);
    localStorage.removeItem(`quiz_${id}_started`);
    localStorage.removeItem(`player_${id}`);
    router.push('/dashboard');
  }, [socket, id, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center text-white">
          <FaSpinner className="animate-spin text-4xl mb-4 mx-auto" />
          <p>Connecting to lobby...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center text-white max-w-md">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold mb-2">Error</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-center text-white">
          <p>Quiz not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/10 backdrop-blur-lg shadow-xl rounded-2xl overflow-hidden mb-6">
          <div className="p-6 border-b border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-3xl font-bold text-white">{quiz.title}</h1>
              <div className="flex items-center gap-3">
                {isHost && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-400/20 text-yellow-300 border border-yellow-400/30">
                    <FaCrown className="mr-1" />
                    Host
                  </span>
                )}
              </div>
            </div>

            <p className="text-white/70 mb-4">
              {countdown !== null
                ? `Starting in ${countdown} seconds...`
                : gameStarted
                ? 'Quiz is starting...'
                : isHost
                ? 'Waiting for participants to join...'
                : 'Waiting for host to start the quiz...'}
            </p>

            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <UserIcon size={16} className="text-white/40 mr-2" />
                <span className="text-sm text-white/70">
                  Host: {quiz.hostName}
                </span>
              </div>
              <div className="flex items-center">
                <TagIcon size={16} className="text-white/40 mr-2" />
                <span className="text-sm text-white/70">
                  {quiz.questions?.length || 0} questions
                </span>
              </div>
              <div className="flex items-center">
                <ClockIcon size={16} className="text-white/40 mr-2" />
                <span className="text-sm text-white/70">
                  {quiz.duration} minutes
                </span>
              </div>
            </div>
          </div>

          {/* Share Section */}
          <div className="p-6 bg-white/5 border-b border-white/20">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex-1">
                <p className="text-sm font-medium text-white mb-2">
                  Share this lobby with others
                </p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 flex items-center bg-white/10 rounded-lg border border-white/20 px-3 py-2">
                    <span className="text-white/70 font-medium mr-2">
                      Join Link:
                    </span>
                    <span className="font-mono font-bold text-white text-sm">
                      {`${window.location.origin}/dashboard/lobby/${id}`}
                    </span>
                  </div>
                  <button
                    onClick={copyInviteLink}
                    className="p-2 bg-white/10 rounded-lg border border-white/20 text-white/70 hover:text-white hover:bg-white/20 transition"
                  >
                    {linkCopied ? (
                      <CheckCircle size={18} className="text-green-400" />
                    ) : (
                      <CopyIcon size={18} />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                {!isHost && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="ready"
                      checked={isReady}
                      onChange={handleReadyToggle}
                      className="h-4 w-4 text-blue-500 focus:ring-blue-400 border-white/30 rounded bg-white/10"
                    />
                    <label htmlFor="ready" className="ml-2 text-sm text-white">
                      I am ready
                    </label>
                  </div>
                )}

                <button
                  onClick={copyInviteLink}
                  className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  <ShareIcon size={18} className="mr-2" />
                  Share Link
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Countdown Modal */}
        <AnimatePresence>
          {countdown !== null && countdown >= 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 text-center border border-white/20"
              >
                <div className="text-6xl font-bold text-white mb-4">
                  {countdown}
                </div>
                <p className="text-white/70 text-lg">Quiz starting...</p>
                <p className="text-white/50 text-sm mt-2">Get ready!</p>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Participants Section */}
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white flex items-center">
              <UsersIcon size={24} className="mr-2 text-blue-400" />
              Participants ({participants.length})
            </h2>
            <p className="text-sm text-white/60">
              {participants.length < 2
                ? 'Waiting for more players...'
                : `${participants.filter((p) => p.isReady).length} ready`}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
            {participants.map((participant, index) => (
              <motion.div
                key={participant.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex items-center p-4 rounded-xl ${
                  participant.isHost
                    ? 'bg-yellow-400/20 border border-yellow-400/30'
                    : 'bg-white/10 border border-white/20'
                }`}
              >
                <div className="relative">
                  <Image
                    src={avatars[participant.avatar]?.src || '/avatars/avatar1.png'}
                    alt={participant.name}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  {participant.isHost && (
                    <FaCrown className="absolute -top-1 -right-1 w-4 h-4 text-yellow-400" />
                  )}
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-white">
                    {participant.name}
                  </p>
                  <p className="text-xs text-white/50 font-mono">
                    ID: {participant.id?.slice(-6)}
                  </p>
                  <div className="flex items-center mt-1">
                    {participant.isHost ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-400/20 text-yellow-300">
                        Host
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          participant.isReady
                            ? 'bg-green-400/20 text-green-300'
                            : 'bg-white/10 text-white/60'
                        }`}
                      >
                        {participant.isReady ? 'Ready' : 'Not Ready'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
              </motion.div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between items-center pt-6 border-t border-white/20">
            <button
              onClick={leaveLobby}
              className="flex items-center text-white/60 hover:text-white font-medium transition"
            >
              <ArrowLeft size={18} className="mr-2" />
              Leave Lobby
            </button>

            {isHost ? (
              <button
                onClick={handleStartQuiz}
                disabled={participants.length < 1 || gameStarted}
                className={`px-8 py-3 font-semibold rounded-xl transition ${
                  participants.length < 1 || gameStarted
                    ? 'bg-white/10 text-white/40 cursor-not-allowed'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600'
                }`}
              >
                {gameStarted
                  ? 'Starting...'
                  : `Start Quiz (${quiz.questions?.length || 0} questions)`}
              </button>
            ) : (
              <div className="text-center">
                <p className="text-white/60 text-sm mb-2">
                  Waiting for host to start
                </p>
                <div className="w-6 h-6 mx-auto">
                  <FaSpinner className="animate-spin text-white/40" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
