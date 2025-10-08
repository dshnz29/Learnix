'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { 
  FaUsers, 
  FaTrash, 
  FaSignOutAlt, 
  FaUser, 
  FaEdit, 
  FaCog,
  FaEnvelope,
  FaGraduationCap,
  FaBuilding,
  FaTimes
} from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import Image from 'next/image';

export default function Dashboard() {
  const [date, setDate] = useState(new Date());
  const [showPopup, setShowPopup] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [reminderText, setReminderText] = useState('');
  const [reminders, setReminders] = useState({});
  const [loading, setLoading] = useState(false);

  const { user, userProfile, logout } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleDateClick = (selectedDate) => {
    setDate(selectedDate);
    setReminderText(reminders[selectedDate.toDateString()] || '');
    setShowPopup(true);
  };

  const saveReminder = () => {
    if (!reminderText.trim()) return;
    setReminders((prev) => ({
      ...prev,
      [date.toDateString()]: reminderText,
    }));
    setShowPopup(false);
  };

  const deleteReminder = (key) => {
    const updated = { ...reminders };
    delete updated[key];
    setReminders(updated);
  };

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setLoading(false);
      setShowLogoutConfirm(false);
    }
  };

  // Get user's first name for greeting
  const getUserName = () => {
    if (userProfile?.firstName) {
      return userProfile.firstName;
    }
    if (userProfile?.displayName) {
      return userProfile.displayName.split(' ')[0];
    }
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    return 'User';
  };

  const getAvatarUrl = () => {
    if (userProfile?.photoURL) {
      return userProfile.photoURL;
    }
    if (userProfile?.avatar !== undefined) {
      return `/avatars/avatar${userProfile.avatar + 1}.png`;
    }
    return '/avatars/avatar1.png';
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#382693] to-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen  font-sans transition-colors duration-500 p-8 space-y-6 mt-3">

        {/* Header with Profile and Logout */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <h2 className="text-2xl font-bold text-white drop-shadow-md mb-4 md:mb-0">
            Hello, {getUserName()} 👋 <br className="md:hidden" /> 
            <span className="text-[#18DEA3]">How can I help you today?</span>
          </h2>
          
          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button className="bg-[#18DEA3] text-white px-4 py-2 rounded-xl shadow hover:bg-[#18DEA3]/80 transition">
              Ask AI
            </button>
            <button className="bg-white/10 text-white px-4 py-2 rounded-xl border border-white/20 hover:bg-white/20 transition">
              Get tasks updates
            </button>
            <button className="bg-white/10 text-white px-4 py-2 rounded-xl border border-white/20 hover:bg-white/20 transition">
              Create workspace
            </button>
            
            {/* Profile Button */}
            <button
              onClick={() => setShowProfileModal(true)}
              className="flex items-center space-x-2 bg-white/10 text-white px-4 py-2 rounded-xl border border-white/20 hover:bg-white/20 transition"
            >
              <Image
                src={getAvatarUrl()}
                alt="Profile"
                width={24}
                height={24}
                className="rounded-full"
              />
              <FaUser size={14} />
            </button>

            {/* Logout Button */}
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center space-x-2 bg-red-500/20 text-red-300 px-4 py-2 rounded-xl border border-red-400/30 hover:bg-red-500/30 transition"
            >
              <FaSignOutAlt size={14} />
              <span>Logout</span>
            </button>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="space-y-6 col-span-1">
            <SummaryCard title="Total Quizzes" value="24" subtitle="Quizzes taken" />
            <SummaryCard title="Average Score" value="76%" subtitle="Across all quizzes" />
            <SummaryCard title="Knowledge Areas" value="8" subtitle="Topics Explored" />
          </div>

          {/* Middle Column */}
          <div className="space-y-6 col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="rounded-xl p-6 shadow-lg border border-white/30 text-white backdrop-blur-lg bg-white/10 transition-colors duration-300"
            >
              <h3 className="text-lg font-semibold mb-4 drop-shadow-md">Calendar</h3>
              <Calendar
                onChange={handleDateClick}
                value={date}
                className="react-calendar"
                showNeighboringMonth={false}
              />
              <p className="mt-4 text-center text-white/80">Selected date: {date.toDateString()}</p>
              {reminders[date.toDateString()] && (
                <p className="mt-2 text-sm text-[#18DEA3] text-center">🔔 {reminders[date.toDateString()]}</p>
              )}
            </motion.div>
          </div>

          {/* Right Column */}
          <div className="space-y-6 col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="rounded-xl p-6 shadow-lg border border-white/30 text-white backdrop-blur-lg bg-white/10 transition-colors duration-300"
            >
              <h3 className="text-lg font-semibold mb-4 drop-shadow-md">Learning Suggestions</h3>
              <p className="text-sm text-gray-300">
                No suggestions available at the moment.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="rounded-xl p-6 shadow-lg border border-white/30 text-white backdrop-blur-lg bg-white/10 transition-colors duration-300"
            >
              <h3 className="text-lg font-semibold mb-4 drop-shadow-md">Reminders</h3>
              {Object.keys(reminders).length === 0 ? (
                <p className="text-sm text-white/80 italic">No reminders set.</p>
              ) : (
                <ul className="text-sm text-white/80 pl-2 space-y-2">
                  {Object.entries(reminders).map(([key, text], i) => (
                    <li key={i} className="flex justify-between items-center bg-white/10 px-3 py-2 rounded-md">
                      <span><span className="text-[#18DEA3] font-semibold">{key}:</span> {text}</span>
                      <button onClick={() => deleteReminder(key)} className="text-red-400 hover:text-red-600">
                        <FaTrash />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="rounded-xl p-6 shadow-lg border border-white/30 text-white backdrop-blur-lg bg-white/10 transition-colors duration-300"
            >
              <h3 className="text-lg font-semibold mb-2 drop-shadow-md">Meeting with VP</h3>
              <p className="text-sm text-white/80 mb-2">Today · 10:00 – 11:00 AM</p>
              <div className="flex items-center gap-2 text-sm text-[#18DEA3]">
                <FaUsers /> Google Meet
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      <AnimatePresence>
        {showProfileModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-md flex items-center justify-center z-50 p-4 "
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-xl p-8 rounded-2xl w-full max-w-md shadow-2xl text-white relative"
            >
              {/* Close Button */}
              <button
                onClick={() => setShowProfileModal(false)}
                className="absolute top-4 right-4 text-white/60 hover:text-white transition"
              >
                <FaTimes size={20} />
              </button>

              {/* Profile Header */}
              <div className="text-center mb-6">
                <div className="relative inline-block mb-4">
                  <Image
                    src={getAvatarUrl()}
                    alt="Profile"
                    width={80}
                    height={80}
                    className="rounded-full mx-auto border-4 border-[#18DEA3]/30"
                  />
                  <button className="absolute bottom-0 right-0 bg-[#18DEA3] rounded-full p-2 text-white hover:bg-[#18DEA3]/80 transition">
                    <FaEdit size={12} />
                  </button>
                </div>
                <h2 className="text-2xl font-bold mb-1">
                  {userProfile?.displayName || user?.displayName || 'User'}
                </h2>
                <p className="text-[#18DEA3] capitalize">
                  {userProfile?.role || 'Student'}
                </p>
              </div>

              {/* Profile Information */}
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <FaEnvelope className="text-[#18DEA3]" />
                  <div>
                    <p className="text-sm text-white/60">Email</p>
                    <p className="text-white">{user?.email}</p>
                  </div>
                </div>

                {userProfile?.username && (
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <FaUser className="text-[#18DEA3]" />
                    <div>
                      <p className="text-sm text-white/60">Username</p>
                      <p className="text-white">@{userProfile.username}</p>
                    </div>
                  </div>
                )}

                {userProfile?.institution && (
                  <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                    <FaBuilding className="text-[#18DEA3]" />
                    <div>
                      <p className="text-sm text-white/60">Institution</p>
                      <p className="text-white">{userProfile.institution}</p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-3 p-3 bg-white/5 rounded-lg">
                  <FaGraduationCap className="text-[#18DEA3]" />
                  <div>
                    <p className="text-sm text-white/60">Member Since</p>
                    <p className="text-white">
                      {userProfile?.createdAt?.toDate?.()?.toLocaleDateString() || 
                       user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : 
                       'Recently'}
                    </p>
                  </div>
                </div>

                {/* Stats */}
                {userProfile?.stats && (
                  <div className="grid grid-cols-2 gap-3 mt-6">
                    <div className="bg-gradient-to-r from-[#18DEA3]/20 to-[#382693]/20 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-[#18DEA3]">{userProfile.stats.quizzesCreated || 0}</p>
                      <p className="text-xs text-white/60">Quizzes Created</p>
                    </div>
                    <div className="bg-gradient-to-r from-[#382693]/20 to-[#18DEA3]/20 p-3 rounded-lg text-center">
                      <p className="text-2xl font-bold text-[#18DEA3]">{userProfile.stats.quizzesTaken || 0}</p>
                      <p className="text-xs text-white/60">Quizzes Taken</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => {
                    setShowProfileModal(false);
                    router.push('/dashboard/profile');
                  }}
                  className="flex-1 bg-gradient-to-r from-[#18DEA3] to-[#382693] py-2 px-4 rounded-lg font-semibold hover:shadow-lg transition flex items-center justify-center gap-2"
                >
                  <FaEdit size={14} />
                  Edit Profile
                </button>
                <button 
                  onClick={() => {
                    setShowProfileModal(false);
                    router.push('/dashboard/settings');
                  }}
                  className="flex-1 bg-white/10 border border-white/20 py-2 px-4 rounded-lg font-semibold hover:bg-white/20 transition flex items-center justify-center gap-2"
                >
                  <FaCog size={14} />
                  Settings
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-xl p-6 rounded-2xl w-full max-w-sm shadow-2xl text-white"
            >
              <div className="text-center">
                <div className="mb-4">
                  <FaSignOutAlt size={48} className="text-red-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Confirm Logout</h3>
                  <p className="text-white/70">Are you sure you want to sign out?</p>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowLogoutConfirm(false)}
                    className="flex-1 bg-white/10 border border-white/20 py-2 px-4 rounded-lg font-semibold hover:bg-white/20 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="flex-1 bg-red-500 py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                        Signing out...
                      </div>
                    ) : (
                      'Sign Out'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reminder Popup */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="glass-popup bg-white/10 border border-white/20 backdrop-blur-xl p-6 rounded-2xl w-[90%] md:w-[400px] shadow-2xl space-y-4 text-white relative"
            >
              <h2 className="text-xl font-semibold drop-shadow">Set Reminder for {date.toDateString()}</h2>
              <input
                type="text"
                value={reminderText}
                onChange={(e) => setReminderText(e.target.value)}
                placeholder="Reminder details..."
                className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/30 placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-[#18DEA3]/50"
              />
              <div className="flex justify-end space-x-3 mt-3">
                <button 
                  onClick={() => setShowPopup(false)} 
                  className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={saveReminder} 
                  className="px-4 py-2 bg-[#18DEA3] text-white rounded-lg hover:bg-[#18DEA3]/80 transition"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Styles */}
      <style jsx global>{`
        .react-calendar {
          background-color: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          border-radius: 1rem;
          box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.2);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          color: white;
          font-family: inherit;
          width: 100%;
          overflow: hidden;
        }

        .glass-popup {
          animation: liquidPulse 6s ease-in-out infinite alternate;
        }

        @keyframes liquidPulse {
          0% {
            box-shadow: 0 0 20px rgba(24, 222, 163, 0.4), inset 0 0 10px rgba(24, 222, 163, 0.1);
          }
          100% {
            box-shadow: 0 0 40px rgba(24, 222, 163, 0.7), inset 0 0 20px rgba(24, 222, 163, 0.3);
          }
        }

        .react-calendar__tile {
          background: transparent;
          color: white;
          border-radius: 8px;
          padding: 0.5rem 0;
          transition: background-color 0.3s ease;
          font-weight: 500;
          cursor: pointer;
        }

        .react-calendar__tile:enabled:hover,
        .react-calendar__tile:enabled:focus {
          background: rgba(255, 255, 255, 0.2);
          outline: none;
        }

        .react-calendar__tile--now {
          background: rgba(255, 255, 255, 0.25);
          font-weight: 700;
          border-radius: 8px;
          color: #18DEA3;
        }

        .react-calendar__tile--active {
          background: rgba(24, 222, 163, 0.8);
          color: #000;
          font-weight: 700;
          border-radius: 8px;
        }

        .react-calendar__navigation button {
          color: white;
          font-weight: bold;
          background: transparent;
          border: none;
          border-radius: 0.5rem;
          padding: 0.4rem;
          transition: background-color 0.3s ease;
        }

        .react-calendar__navigation button:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </>
  );
}

// Summary Card Component
function SummaryCard({ title, value, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="rounded-xl p-6 shadow-lg border border-white/30 text-white backdrop-blur-lg bg-white/10 drop-shadow-md transition-colors duration-300"
    >
      <h4 className="text-md font-medium mb-1">{title}</h4>
      <p className="text-3xl font-bold mb-1 text-[#18DEA3]">{value}</p>
      <span className="text-sm opacity-80">{subtitle}</span>
    </motion.div>
  );
}
