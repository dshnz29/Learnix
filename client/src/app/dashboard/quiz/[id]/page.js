"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClockIcon } from 'lucide-react';
import { useParams } from 'next/navigation';

const LiveQuizPage = () => {
  const router = useRouter();
  const { id } = useParams();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);

  const quiz = {
    id,
    title: 'LearniX - Quiz Space',
    questions: [
      {
        id: 1,
        text: 'Which of the following best describes the purpose of an Operating System (OS) in a computer?',
        options: [
          { id: 1, text: 'It provides internet connectivity to the computer.', isCorrect: false },
          { id: 2, text: 'It acts as an interface between the user and the hardware', isCorrect: true },
          { id: 3, text: 'It compiles high-level code into machine code.', isCorrect: false },
          { id: 4, text: 'It is used solely for virus protection and system security.', isCorrect: false },
        ],
        timeLimit: 20,
      }
    ],
    participants: [
      { id: 1, avatar: '/avatars/avatar1.png' },
      { id: 2, avatar: '/avatars/avatar2.png' },
      { id: 3, avatar: '/avatars/avatar3.png' },
      { id: 4, avatar: '/avatars/avatar4.png' },
    ]
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];

  useEffect(() => {
    if (timeLeft > 0 && !isAnswerLocked) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft, isAnswerLocked]);

  const handleOptionSelect = (id) => {
    if (isAnswerLocked) return;
    setSelectedOption(id);
    setIsAnswerLocked(true);
  };

  return (
    <div className="min-h-screen  text-white font-sans p-6 ">
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-bold">LearniX.</h1>
          <p className="text-sm text-white/80">Quiz Space</p>
        </div>
        <div className="flex gap-2">
          {quiz.participants.map((p) => (
            <img key={p.id} src={p.avatar} className="w-10 h-10 rounded-full border-2 border-white" />
          ))}
          <div className="w-10 h-10 rounded-full border-2 border-white bg-white/20 grid place-items-center">
            <span className="text-lg font-semibold">+</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3 bg-white/10 p-6 rounded-xl space-y-6 border border-white/20 backdrop-blur-md">
          <h2 className="text-xl font-medium bg-white/70 p-4 text-black rounded-2xl">
            {currentQuestion.text}
          </h2>
          <div className="space-y-4">
            {currentQuestion.options.map((opt, index) => (
              <button
                key={opt.id}
                onClick={() => handleOptionSelect(opt.id)}
                disabled={isAnswerLocked}
                className={`w-full flex items-center text-left px-4 py-3 rounded-xl transition-all duration-200 font-medium shadow ${
                  selectedOption === opt.id
                    ? opt.isCorrect
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-white/20 hover:bg-white/30'
                }`}
              >
                <span className="w-6 h-6 mr-4 flex items-center justify-center rounded-full bg-white text-black font-bold">
                  {String.fromCharCode(65 + index)}
                </span>
                {opt.text}
              </button>
            ))}
          </div>
          <div className="flex justify-end gap-4 mt-6">
            <button className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30">❮</button>
            <button className="px-4 py-2 bg-white/20 rounded-lg hover:bg-white/30">❯</button>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white/10 text-center py-6 rounded-xl border border-white/20 backdrop-blur-md">
            <div className="text-4xl font-bold">00 : {timeLeft.toString().padStart(2, '0')}</div>
            <p className="text-sm mt-2">Time Remaining</p>
          </div>

          <div className="bg-white/10 p-4 rounded-xl border border-white/20 backdrop-blur-md">
            <p className="mb-2 text-white/80">Questions</p>
            <div className="grid grid-cols-4 gap-2">
              {quiz.questions.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-8 h-8 flex items-center justify-center rounded-md font-semibold ${
                    idx === currentQuestionIndex ? 'bg-yellow-300 text-black' : 'bg-white/20 text-white/80'
                  }`}
                >
                  {idx + 1}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveQuizPage;
