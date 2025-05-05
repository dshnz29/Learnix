import React from 'react';
import Link from 'next/link';
import { ArrowLeftIcon, SearchIcon, UsersIcon, ClockIcon, TagIcon } from 'lucide-react';

const quizzes = [
  {
    id: 1,
    title: 'Science Trivia Challenge',
    creator: 'Sarah Johnson',
    participants: 8,
    questions: 15,
    time: '20 min',
    difficulty: 'Medium',
    tags: ['Science', 'Biology', 'Chemistry']
  },
  {
    id: 2,
    title: 'History of Ancient Civilizations',
    creator: 'Michael Brown',
    participants: 5,
    questions: 20,
    time: '30 min',
    difficulty: 'Hard',
    tags: ['History', 'Ancient', 'Civilization']
  },
  {
    id: 3,
    title: 'Fun Pop Culture Quiz',
    creator: 'Emma Wilson',
    participants: 12,
    questions: 10,
    time: '15 min',
    difficulty: 'Easy',
    tags: ['Entertainment', 'Movies', 'Music']
  },
  {
    id: 4,
    title: 'Geography World Tour',
    creator: 'David Miller',
    participants: 7,
    questions: 25,
    time: '35 min',
    difficulty: 'Medium',
    tags: ['Geography', 'World', 'Travel']
  }
];

const JoinQuizPage = () => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
          <ArrowLeftIcon size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Join a Quiz</h1>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <SearchIcon size={18} className="text-gray-400" />
          </div>
          <input
            type="search"
            className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Search for quizzes by title, topic, or creator"
          />
        </div>
        <button className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white hover:bg-gray-50">
          Filters
        </button>
      </div>

      {/* Available Quizzes Section */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Top Bar */}
        <div className="p-4 sm:p-6 border-b">
          <h2 className="text-lg font-medium text-gray-900">Available Quizzes</h2>
          <p className="mt-1 text-sm text-gray-500">Join a public quiz or enter a code to join a private one.</p>
        </div>

        {/* Code Entry */}
        <div className="p-4 border-b bg-gray-50 flex items-center gap-2">
          <span className="text-gray-500 text-sm">Have a quiz code?</span>
          <div className="relative flex-1 max-w-xs">
            <input
              type="text"
              className="w-full pr-20 border border-gray-300 rounded-md text-sm placeholder-gray-500 focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Enter code"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <button className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
                Join
              </button>
            </div>
          </div>
        </div>

        {/* Quiz List */}
        <ul className="divide-y divide-gray-200">
          {quizzes.map((quiz) => (
            <li key={quiz.id} className="p-4 sm:p-6 hover:bg-gray-50">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{quiz.title}</h3>
                  <p className="text-sm text-gray-500">Created by {quiz.creator}</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {quiz.difficulty}
                    </span>
                    {quiz.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <div className="flex items-center gap-6 text-sm text-gray-500">
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
                      {quiz.questions} questions
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
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default JoinQuizPage;
