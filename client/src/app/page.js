'use client';

import { motion } from "framer-motion";
import {
  FaMicrophone,
  FaCrown,
  FaHistory,
  FaRocket,
  FaPlus,
  FaHome,
  FaUsers
} from "react-icons/fa";

export default function Dashboard() {
  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#1a4c56] via-[#124077] to-[#2b2477] bg-[url('/bg.png')] bg-cover text-white font-sans">
      
      {/* Sidebar (optional) */}
      
      {/* Main Content */}
      <main className="flex-1 p-8 space-y-6">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-semibold text-white"
        >
          Dashboard
        </motion.h2>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SummaryCard
            title="Total Quizzes"
            value="24"
            subtitle="Quizzes taken"
            color="bg-white/10 backdrop-blur-lg border border-white/20"
          />
          <SummaryCard
            title="Average Score"
            value="76%"
            subtitle="Across all quizzes"
            color="bg-white/10 backdrop-blur-lg border border-white/20"
          />
          <SummaryCard
            title="Knowledge Areas"
            value="8"
            subtitle="Topics Expired"
            color="bg-white/10 backdrop-blur-lg border border-white/20"
          />
        </div>

        {/* Quiz Activity and Suggestions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-md border border-white/20"
          >
            <h3 className="text-lg font-semibold mb-4">Recent Quiz Activity</h3>
            {[1, 2, 3].map((_, i) => (
              <div
                key={i}
                className="flex justify-between items-center border-b border-white/20 py-2"
              >
                <span>Science Trivia</span>
                <div className="text-sm text-teal-200">8/10</div>
                <div className="text-sm text-green-300 cursor-pointer hover:underline">View Details</div>
              </div>
            ))}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-md border border-white/20"
          >
            <h3 className="text-lg font-semibold mb-4">Learning Suggestions</h3>
            <p className="text-sm text-gray-300">No suggestions available at the moment.</p>
          </motion.div>
        </div>
      </main>
    </div>
  );
}

// Sidebar Item
function SidebarItem({ icon, label, active }) {
  return (
    <div
      className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors cursor-pointer ${
        active ? "bg-green-400 text-gray-900" : "hover:bg-teal-600"
      }`}
    >
      <div className="text-xl">{icon}</div>
      <span className="text-md font-medium">{label}</span>
    </div>
  );
}

// Summary Card
function SummaryCard({ title, value, subtitle, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.3 }}
      className={`rounded-xl p-6 shadow-md text-white ${color}`}
    >
      <h4 className="text-md font-medium mb-1">{title}</h4>
      <p className="text-3xl font-bold mb-1">{value}</p>
      <span className="text-sm text-white/80">{subtitle}</span>
    </motion.div>
  );
}
