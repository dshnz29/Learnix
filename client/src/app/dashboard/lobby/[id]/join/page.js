'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { UserIcon, ArrowRight, Shuffle, ArrowLeft } from 'lucide-react';
import Image from 'next/image';

const JoinLobbyPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [playerName, setPlayerName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const avatars = [
    { src: '/avatars/avatar1.png', id: 0, name: 'Avatar 1' },
    { src: '/avatars/avatar2.png', id: 1, name: 'Avatar 2' },
    { src: '/avatars/avatar3.png', id: 2, name: 'Avatar 3' },
  ];

  const generateRandomName = () => {
    const adjectives = ['Cool', 'Smart', 'Fast', 'Brave', 'Quick', 'Clever', 'Swift', 'Bold'];
    const nouns = ['Player', 'Gamer', 'Ninja', 'Hero', 'Star', 'Ace', 'Pro', 'Champion'];
    const randomAdj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomNum = Math.floor(Math.random() * 999) + 1;
    
    setPlayerName(`${randomAdj}${randomNoun}${randomNum}`);
  };

  const handleJoinLobby = async () => {
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (playerName.trim().length < 2) {
      setError('Name must be at least 2 characters');
      return;
    }

    if (playerName.trim().length > 20) {
      setError('Name must be less than 20 characters');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      // Generate unique player ID
      const playerId = `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store player data in localStorage for the lobby page
      const playerData = {
        id: playerId,
        name: playerName.trim(),
        avatar: selectedAvatar,
        isHost: false,
        isReady: false,
        joinedAt: new Date().toISOString()
      };

      localStorage.setItem(`player_${id}`, JSON.stringify(playerData));
      
      console.log('👤 Player data stored:', playerData);
      
      // Navigate to the actual lobby
      router.push(`/dashboard/lobby/${id}`);
      
    } catch (error) {
      console.error('Error joining lobby:', error);
      setError('Failed to join lobby. Please try again.');
      setIsJoining(false);
    }
  };

  const handleRandomAvatar = () => {
    const randomAvatar = Math.floor(Math.random() * avatars.length);
    setSelectedAvatar(randomAvatar);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20 max-w-md w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4"
          >
            <UserIcon size={32} className="text-white" />
          </motion.div>
          <h1 className="text-2xl font-bold text-white mb-2">Join Quiz Lobby</h1>
          <p className="text-white/70 text-sm">
            Enter your details to join the quiz
          </p>
          <p className="text-white/50 text-xs mt-2 font-mono">
            Lobby ID: {id?.slice(0, 8)}...
          </p>
        </div>

        <div className="space-y-6">
          {/* Name Input */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Your Name
            </label>
            <div className="relative">
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Enter your name..."
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                maxLength={20}
                onKeyPress={(e) => e.key === 'Enter' && handleJoinLobby()}
              />
              <button
                type="button"
                onClick={generateRandomName}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-white/60 hover:text-white transition"
                title="Generate random name"
              >
                <Shuffle size={16} />
              </button>
            </div>
            <p className="text-xs text-white/50 mt-1">
              {playerName.length}/20 characters
            </p>
          </div>

          {/* Avatar Selection */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-medium text-white">
                Choose Avatar
              </label>
              <button
                type="button"
                onClick={handleRandomAvatar}
                className="text-xs text-blue-400 hover:text-blue-300 transition"
              >
                Random
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {avatars.map((avatar) => (
                <motion.button
                  key={avatar.id}
                  type="button"
                  onClick={() => setSelectedAvatar(avatar.id)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`relative p-3 rounded-xl transition ${
                    selectedAvatar === avatar.id
                      ? 'bg-blue-500/30 border-2 border-blue-400'
                      : 'bg-white/10 border-2 border-transparent hover:bg-white/20'
                  }`}
                >
                  <Image
                    src={avatar.src}
                    alt={avatar.name}
                    width={60}
                    height={60}
                    className="rounded-full mx-auto"
                  />
                  {selectedAvatar === avatar.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center"
                    >
                      <span className="text-white text-xs">✓</span>
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-500/20 border border-red-400/30 rounded-lg p-3"
            >
              <p className="text-red-300 text-sm">{error}</p>
            </motion.div>
          )}

          {/* Join Button */}
          <motion.button
            onClick={handleJoinLobby}
            disabled={isJoining || !playerName.trim()}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 px-4 rounded-lg font-semibold transition flex items-center justify-center ${
              isJoining || !playerName.trim()
                ? 'bg-white/10 text-white/40 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600'
            }`}
          >
            {isJoining ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Joining Lobby...
              </>
            ) : (
              <>
                Join Lobby
                <ArrowRight size={20} className="ml-2" />
              </>
            )}
          </motion.button>

          {/* Back Button */}
          <button
            onClick={() => router.back()}
            className="w-full py-2 px-4 rounded-lg font-medium transition flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft size={16} className="mr-2" />
            Go Back
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default JoinLobbyPage;