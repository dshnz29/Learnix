'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowLeftIcon,
  SearchIcon,
  UsersIcon,
  ClockIcon,
  TagIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';

const quizzes = [
  {
    id: 1,
    title: 'Science Trivia Challenge',
    creator: 'Sarah Johnson',
    participants: 8,
    questions: 15,
    time: '20 Min',
    difficulty: 'Medium',
    tags: ['Science', 'Biology', 'Chemistry'],
  },
  {
    id: 2,
    title: 'History of Ancient Civilizations',
    creator: 'Michael Brown',
    participants: 5,
    questions: 20,
    time: '30 Min',
    difficulty: 'Hard',
    tags: ['History', 'Ancient', 'Civilization'],
  },
  {
    id: 3,
    title: 'Fun Pop Culture Quiz',
    creator: 'Emma Wilson',
    participants: 12,
    questions: 10,
    time: '15 Min',
    difficulty: 'Easy',
    tags: ['Entertainment', 'Movies', 'Music'],
  },
  {
    id: 4,
    title: 'Geography World Tour',
    creator: 'David Miller',
    participants: 7,
    questions: 25,
    time: '35 Min',
    difficulty: 'Medium',
    tags: ['Geography', 'World', 'Travel'],
  },
];

const JoinQuizPage = () => {
  return (
    <motion.div
      className="min-h-screen p-6 text-white font-sans space-y-8 bg-cover"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-white hover:text-gray-200">
          <ArrowLeftIcon size={20} />
        </Link>
        <h1 className="text-2xl font-bold">Join a Quiz</h1>
      </div>

      {/* Search and Filters */}
      <motion.div
        className="flex flex-col md:flex-row gap-4"
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon size={18} className="text-white/50" />
          </div>
          <input
            type="search"
            className="w-full pl-10 pr-3 py-2 bg-white/10 border border-white/20 rounded-md text-sm placeholder-white/70 text-white focus:ring-2 focus:ring-lime-400 focus:outline-none"
            placeholder="Search for quizzes by title, topic, or creator"
          />
        </div>
        <button className="px-4 py-2 bg-white/10 border border-white/20 rounded-md text-sm text-white hover:bg-white/20">
          Filters
        </button>
      </motion.div>

      {/* Available Quizzes Section */}
      <motion.div
        className="bg-white/5 border border-white/20 backdrop-blur-md rounded-xl shadow-xl"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.6 }}
      >
        <div className="p-6 border-b border-white/10">
          <h2 className="text-lg font-semibold">Available Quizzes</h2>
          <p className="text-sm text-white/60 mt-1">
            Join a public quiz or enter a code to join a private one.
          </p>
        </div>

        {/* Code Input */}
        <motion.div
          className="p-4 border-b border-white/10 bg-white/10 flex items-center gap-3"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
        >
          <span className="text-white/70 text-sm">Have a quiz code?</span>
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              className="w-full pr-20 bg-white/10 border border-white/20 rounded-md text-sm placeholder-white/60 text-white focus:ring-2 focus:ring-lime-400 focus:outline-none"
              placeholder="Enter code"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-2">
              <button className="text-lime-300 hover:text-lime-400 text-sm font-semibold">
                Join
              </button>
            </div>
          </div>
        </motion.div>

        {/* Quiz List */}
        <motion.ul
          className="divide-y divide-white/10"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {quizzes.map((quiz, index) => (
            <motion.li
              key={quiz.id}
              className="p-4 sm:p-6 hover:bg-white/10"
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 },
              }}
              transition={{ duration: 0.4 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-white">{quiz.title}</h3>
                  <p className="text-sm text-white/60">Created by {quiz.creator}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-300/20 text-blue-200">
                      {quiz.difficulty}
                    </span>
                    {quiz.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/10 text-white/80"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-6 text-sm text-white/70">
                    <span className="flex items-center">
                      <UsersIcon size={16} className="mr-1" />
                      {quiz.participants} joined
                    </span>
                    <span className="flex items-center">
                      <ClockIcon size={16} className="mr-1" />
                      {quiz.time}
                    </span>
                    <span className="flex items-center">
                      <TagIcon size={16} className="mr-1" />
                      {quiz.questions} Questions
                    </span>
                  </div>
                  <Link
                    href={`/lobby/${quiz.id}`}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Join Quiz
                  </Link>
                </div>
              </div>
            </motion.li>
          ))}
        </motion.ul>
      </motion.div>
    </motion.div>
  );
};

export default JoinQuizPage;
