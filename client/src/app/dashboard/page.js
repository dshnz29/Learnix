'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { FaUsers, FaTrash } from 'react-icons/fa';

export default function Dashboard() {
  const [date, setDate] = useState(new Date());
  const [showPopup, setShowPopup] = useState(false);
  const [reminderText, setReminderText] = useState('');
  const [reminders, setReminders] = useState({});

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

  return (
    <>
      <div className="min-h-screen bg-cover bg-center font-sans transition-colors duration-500 p-8 space-y-6 mt-3">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between"
        >
          <h2 className="text-2xl font-bold text-white drop-shadow-md mb-4 md:mb-0">
            Hello, Dishan 👋 <br className="md:hidden" /> <span className="text-teal-300">How can I help you today?</span>
          </h2>
          <div className="flex space-x-3">
            <button className="bg-teal-500 text-white px-4 py-2 rounded-xl shadow hover:bg-teal-600 transition">Ask AI</button>
            <button className="bg-white/10 text-white px-4 py-2 rounded-xl border border-white/20 hover:bg-white/20 transition">Get tasks updates</button>
            <button className="bg-white/10 text-white px-4 py-2 rounded-xl border border-white/20 hover:bg-white/20 transition">Create workspace</button>
            <button className="bg-white/10 text-white px-4 py-2 rounded-xl border border-white/20 hover:bg-white/20 transition">Connect apps</button>
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
                <p className="mt-2 text-sm text-green-400 text-center">🔔 {reminders[date.toDateString()]}</p>
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
                      <span><span className="text-teal-300 font-semibold">{key}:</span> {text}</span>
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
              <div className="flex items-center gap-2 text-sm text-green-300">
                <FaUsers /> Google Meet
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Popup */}
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
                className="w-full p-3 rounded-lg bg-white/10 text-white border border-white/30 placeholder-white/60 focus:outline-none"
              />
              <div className="flex justify-end space-x-3 mt-3">
                <button onClick={() => setShowPopup(false)} className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30 transition">
                  Cancel
                </button>
                <button onClick={saveReminder} className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition">
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
            box-shadow: 0 0 20px rgba(0, 255, 204, 0.4), inset 0 0 10px rgba(0, 255, 204, 0.1);
          }
          100% {
            box-shadow: 0 0 40px rgba(0, 255, 204, 0.7), inset 0 0 20px rgba(0, 255, 204, 0.3);
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
          color: #00ffcc;
        }

        .react-calendar__tile--active {
          background: rgba(0, 255, 204, 0.8);
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

// Summary Card
function SummaryCard({ title, value, subtitle }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.2 }}
      className="rounded-xl p-6 shadow-lg border border-white/30 text-white backdrop-blur-lg bg-white/10 drop-shadow-md transition-colors duration-300"
    >
      <h4 className="text-md font-medium mb-1">{title}</h4>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <span className="text-sm opacity-80">{subtitle}</span>
    </motion.div>
  );
}
