import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router'; // useRouter for Next.js routing
import { ClockIcon, UsersIcon, TrophyIcon } from 'lucide-react';

const LiveQuizPage = () => {
  const router = useRouter();
  const { id } = router.query; // Using query parameter for dynamic routing
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Mock quiz data
  const quiz = {
    id,
    title: 'Science Trivia Challenge',
    questions: [
      {
        id: 1,
        text: 'What is the chemical symbol for gold?',
        options: [
          { id: 1, text: 'Au', isCorrect: true },
          { id: 2, text: 'Ag', isCorrect: false },
          { id: 3, text: 'Fe', isCorrect: false },
          { id: 4, text: 'Gd', isCorrect: false },
        ],
        timeLimit: 15,
      },
      {
        id: 2,
        text: 'Which planet is known as the Red Planet?',
        options: [
          { id: 1, text: 'Venus', isCorrect: false },
          { id: 2, text: 'Mars', isCorrect: true },
          { id: 3, text: 'Jupiter', isCorrect: false },
          { id: 4, text: 'Saturn', isCorrect: false },
        ],
        timeLimit: 15,
      },
      {
        id: 3,
        text: 'What is the largest organ in the human body?',
        options: [
          { id: 1, text: 'Brain', isCorrect: false },
          { id: 2, text: 'Liver', isCorrect: false },
          { id: 3, text: 'Skin', isCorrect: true },
          { id: 4, text: 'Heart', isCorrect: false },
        ],
        timeLimit: 15,
      },
    ],
    participants: [
      { id: 1, name: 'Sarah', score: 200, avatar: 'https://i.pravatar.cc/150?img=1' },
      { id: 2, name: 'John', score: 150, avatar: 'https://i.pravatar.cc/150?img=2' },
      { id: 3, name: 'Emma', score: 250, avatar: 'https://i.pravatar.cc/150?img=3' },
      { id: 4, name: 'David', score: 100, avatar: 'https://i.pravatar.cc/150?img=4' },
      { id: 5, name: 'Olivia', score: 180, avatar: 'https://i.pravatar.cc/150?img=5' },
    ],
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  const handleTimeUp = () => {
    setIsAnswerLocked(true);
    // In a real app, submit the timeout to the server
    moveToNextQuestion();
  };

  const moveToNextQuestion = () => {
    setTimeout(() => {
      if (currentQuestionIndex < quiz.questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(null);
        setTimeLeft(15);
        setIsAnswerLocked(false);
        setShowFeedback(false);
      } else {
        router.push(`/results/${id}`);
      }
    }, 2000);
  };

  const handleOptionSelect = (optionId) => {
    if (isAnswerLocked) return;
    setSelectedOption(optionId);
    setIsAnswerLocked(true);
    setShowFeedback(true);
    // In a real app, submit the answer to the server
    moveToNextQuestion();
  };

  useEffect(() => {
    if (timeLeft > 0 && !isAnswerLocked) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && !isAnswerLocked) {
      handleTimeUp();
    }
  }, [timeLeft, isAnswerLocked]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-6 border-b">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">{quiz.title}</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <UsersIcon size={18} className="text-gray-400 mr-1" />
                <span className="text-sm text-gray-600">{quiz.participants.length} players</span>
              </div>
              <div
                className={`flex items-center px-3 py-1 rounded-full ${
                  timeLeft > 5 ? 'bg-indigo-100 text-indigo-800' : 'bg-red-100 text-red-800 animate-pulse'
                }`}
              >
                <ClockIcon size={16} className="mr-1" />
                <span className="font-medium">{timeLeft}s</span>
              </div>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-500 mb-1">
              <span>
                Question {currentQuestionIndex + 1} of {quiz.questions.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-indigo-600 h-2.5 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%`,
                }}
              ></div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="mb-8">
            <h2 className="text-2xl font-medium text-gray-900 mb-6">{currentQuestion.text}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {currentQuestion.options.map((option) => {
                let buttonClass = 'p-4 border-2 rounded-lg text-left transition-colors relative';
                if (showFeedback && selectedOption === option.id) {
                  buttonClass += option.isCorrect ? ' border-green-500 bg-green-50 text-green-800' : ' border-red-500 bg-red-50 text-red-800';
                } else if (isAnswerLocked) {
                  buttonClass += ' opacity-50 cursor-not-allowed';
                } else {
                  buttonClass += ' border-gray-200 hover:border-indigo-500 hover:bg-indigo-50';
                }
                return (
                  <button
                    key={option.id}
                    className={buttonClass}
                    onClick={() => !isAnswerLocked && handleOptionSelect(option.id)}
                    disabled={isAnswerLocked}
                  >
                    <span className="text-lg font-medium">{option.text}</span>
                    {showFeedback && selectedOption === option.id && (
                      <div className={`absolute top-2 right-2 ${option.isCorrect ? 'text-green-500' : 'text-red-500'}`}>
                        {option.isCorrect ? '✓' : '✗'}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
            {showFeedback && (
              <div
                className={`mt-6 p-4 rounded-lg ${
                  currentQuestion.options.find((o) => o.id === selectedOption)?.isCorrect
                    ? 'bg-green-50 border border-green-200'
                    : 'bg-red-50 border border-red-200'
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    currentQuestion.options.find((o) => o.id === selectedOption)?.isCorrect
                      ? 'text-green-800'
                      : 'text-red-800'
                  }`}
                >
                  {currentQuestion.options.find((o) => o.id === selectedOption)?.isCorrect
                    ? 'Correct! Well done!'
                    : `Incorrect. The correct answer is: ${currentQuestion.options.find((o) => o.isCorrect)?.text}`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="mt-8 bg-white shadow-lg rounded-lg overflow-hidden">
        <div className="p-4 border-b bg-gray-50">
          <div className="flex items-center">
            <TrophyIcon size={20} className="text-yellow-500 mr-2" />
            <h2 className="text-lg font-medium text-gray-900">Leaderboard</h2>
          </div>
        </div>
        <ul className="divide-y divide-gray-200">
          {quiz.participants
            .sort((a, b) => b.score - a.score)
            .map((participant, index) => (
              <li key={participant.id} className="p-4 flex items-center">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-700 font-bold mr-3">
                  {index + 1}
                </div>
                <img src={participant.avatar} alt={participant.name} className="w-8 h-8 rounded-full mr-3" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{participant.name}</p>
                </div>
                <div className="text-lg font-bold text-gray-900">{participant.score}</div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default LiveQuizPage;
