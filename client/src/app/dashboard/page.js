'use client'; // Required if you're using interactive elements

import Link from 'next/link';
import { PlusCircleIcon, UsersIcon, BrainIcon, ClockIcon, CheckCircleIcon, Sidebar } from 'lucide-react';

const DashboardPage = () => {
  const recentQuizzes = [
    { id: 1, title: 'Science Trivia', date: '2023-06-10', score: '8/10', status: 'completed' },
    { id: 2, title: 'History Facts', date: '2023-06-08', score: '7/10', status: 'completed' },
    { id: 3, title: 'Math Challenge', date: '2023-06-05', score: '9/10', status: 'completed' }
  ];

  const learningSuggestions = [
    { id: 1, topic: 'World Geography', reason: 'Based on your history quiz performance' },
    { id: 2, topic: 'Chemical Elements', reason: 'Recommended to improve science knowledge' },
    { id: 3, topic: 'Algebra Fundamentals', reason: 'To strengthen your math skills' }
  ];

  return (
    <div className="space-y-8">

      <header className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <div className="flex space-x-3">
          <Link href="/dashboard/create-quiz" className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            <PlusCircleIcon size={18} className="mr-2" />
            Create Quiz
          </Link>
          <Link href="/dashboard/join-quiz" className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
            <UsersIcon size={18} className="mr-2" />
            Join Quiz
          </Link>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard icon={<div size={24} className="text-blue-500" />} title="Total Quizzes" value="24" description="Quizzes taken" bgColor="bg-blue-50" />
        <StatsCard icon={<CheckCircleIcon size={24} className="text-green-500" />} title="Average Score" value="76%" description="Across all quizzes" bgColor="bg-green-50" />
        <StatsCard icon={<BrainIcon size={24} className="text-purple-500" />} title="Knowledge Areas" value="8" description="Topics explored" bgColor="bg-purple-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Quiz Activity</h2>
          <div className="space-y-4">
            {recentQuizzes.map((quiz) => (
              <div key={quiz.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center">
                  {quiz.status === 'completed' ? (
                    <CheckCircleIcon size={20} className="text-green-500 mr-3" />
                  ) : (
                    <ClockIcon size={20} className="text-yellow-500 mr-3" />
                  )}
                  <div>
                    <h3 className="font-medium text-gray-900">{quiz.title}</h3>
                    <p className="text-sm text-gray-500">{quiz.date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-medium text-gray-900">{quiz.score}</span>
                  <Link href={`/dashboard/results/${quiz.id}`} className="block text-sm text-indigo-600 hover:text-indigo-800">
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <Link href="/dashboard/history" className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-800">
            View all activity →
          </Link>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Learning Suggestions</h2>
          <div className="space-y-4">
            {learningSuggestions.map((suggestion) => (
              <div key={suggestion.id} className="border-b pb-4 last:border-0 last:pb-0">
                <div className="flex items-center">
                  <BrainIcon size={20} className="text-indigo-500 mr-3" />
                  <div>
                    <h3 className="font-medium text-gray-900">{suggestion.topic}</h3>
                    <p className="text-sm text-gray-500">{suggestion.reason}</p>
                  </div>
                </div>
                <div className="mt-2 flex space-x-2">
                  <button className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-100">
                    Find Quiz
                  </button>
                  <button className="text-xs bg-gray-50 text-gray-700 px-2 py-1 rounded hover:bg-gray-100">
                    Study Materials
                  </button>
                </div>
              </div>
            ))}
          </div>
          <Link href="/dashboard/explore" className="mt-4 inline-block text-sm text-indigo-600 hover:text-indigo-800">
            Explore more topics →
          </Link>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ icon, title, value, description, bgColor }) => {
  return (
    <div className={`${bgColor} rounded-lg shadow p-6`}>
      <div className="flex items-center">
        <div className="p-3 rounded-full bg-white shadow-sm mr-4">{icon}</div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          <p className="text-xs text-gray-500">{description}</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
