'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  UserIcon,
  ClockIcon,
  TagIcon,
  ShareIcon,
  CopyIcon,
  UsersIcon,
} from 'lucide-react';

const LobbyPage = () => {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  const [isReady, setIsReady] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [quiz, setQuiz] = useState({
    id,
    title: 'Science Trivia Challenge',
    creator: 'Sarah Johnson',
    questions: 15,
    time: '20 min',
    difficulty: 'Medium',
    code: 'SCI-1234',
    participants: [
      {
        id: 1,
        name: 'Sarah Johnson',
        isHost: true,
        avatar: 'https://i.pravatar.cc/150?img=1',
      },
      {
        id: 2,
        name: 'John Smith',
        isHost: false,
        avatar: 'https://i.pravatar.cc/150?img=2',
      },
      {
        id: 3,
        name: 'Emma Wilson',
        isHost: false,
        avatar: 'https://i.pravatar.cc/150?img=3',
      },
      {
        id: 4,
        name: 'David Miller',
        isHost: false,
        avatar: 'https://i.pravatar.cc/150?img=4',
      },
      {
        id: 5,
        name: 'Olivia Brown',
        isHost: false,
        avatar: 'https://i.pravatar.cc/150?img=5',
      },
    ],
  });

  useEffect(() => {
    const interval = setInterval(() => {
      if (quiz.participants.length < 8) {
        setQuiz((prev) => ({
          ...prev,
          participants: [
            ...prev.participants,
            {
              id: prev.participants.length + 1,
              name: `Player ${prev.participants.length + 1}`,
              isHost: false,
              avatar: `https://i.pravatar.cc/150?img=${prev.participants.length + 6}`,
            },
          ],
        }));
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [quiz]);

  useEffect(() => {
    if (countdown !== null) {
      if (countdown > 0) {
        const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
        return () => clearTimeout(timer);
      } else {
        router.push(`/quiz/${id}`);
      }
    }
  }, [countdown, id, router]);

  const handleStartQuiz = () => {
    setCountdown(5);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-gray-900">{quiz.title}</h1>
          <p className="text-gray-500">Waiting for participants to join...</p>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex items-center">
              <UserIcon size={16} className="text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">Host: {quiz.creator}</span>
            </div>
            <div className="flex items-center">
              <TagIcon size={16} className="text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">
                {quiz.questions} questions
              </span>
            </div>
            <div className="flex items-center">
              <ClockIcon size={16} className="text-gray-400 mr-2" />
              <span className="text-sm text-gray-600">
                Estimated time: {quiz.time}
              </span>
            </div>
          </div>
        </div>

        <div className="p-6 bg-indigo-50 border-b">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-indigo-800">
                Share this quiz with others
              </p>
              <div className="mt-2 flex items-center">
                <div className="flex items-center bg-white rounded-md border border-gray-300 px-3 py-2">
                  <span className="text-gray-600 font-medium mr-2">Quiz Code:</span>
                  <span className="font-mono font-bold">{quiz.code}</span>
                </div>
                <button
                  className="ml-2 p-2 bg-white rounded-md border border-gray-300 text-gray-500 hover:text-gray-700"
                  onClick={() => navigator.clipboard.writeText(quiz.code)}
                >
                  <CopyIcon size={18} />
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="ready"
                  checked={isReady}
                  onChange={(e) => setIsReady(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="ready" className="ml-2 text-sm text-indigo-800">
                  I am ready
                </label>
              </div>
              <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                <ShareIcon size={18} className="mr-2" />
                Share Invite Link
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {countdown !== null && (
            <div className="mb-6 text-center">
              <div className="text-4xl font-bold text-indigo-600 mb-2">
                Starting in {countdown}
              </div>
              <p className="text-gray-600">Get ready!</p>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 flex items-center">
              <UsersIcon size={20} className="mr-2 text-indigo-500" />
              Participants ({quiz.participants.length})
            </h2>
            <p className="text-sm text-gray-500">
              {quiz.participants.length < 2
                ? 'Waiting for more players...'
                : 'Ready to start!'}
            </p>
          </div>

          <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {quiz.participants.map((participant) => (
              <li
                key={participant.id}
                className={`flex items-center p-3 rounded-lg ${
                  participant.isHost ? 'bg-indigo-50' : 'bg-gray-50'
                }`}
              >
                <img
                  src={participant.avatar}
                  alt={participant.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    {participant.name}
                  </p>
                  <div className="flex items-center mt-1">
                    {participant.isHost ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                        Host
                      </span>
                    ) : (
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                          isReady
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {isReady ? 'Ready' : 'Not Ready'}
                      </span>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-gray-50 p-6 flex justify-between items-center">
          <Link
            href="/dashboard"
            className="text-gray-600 hover:text-gray-900 font-medium"
          >
            Leave Lobby
          </Link>
          {quiz.participants[0].isHost && (
            <button
              onClick={handleStartQuiz}
              disabled={quiz.participants.length < 2 || countdown !== null}
              className={`px-6 py-3 font-medium rounded-md ${
                quiz.participants.length < 2 || countdown !== null
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
              }`}
            >
              Start Quiz
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default LobbyPage;
