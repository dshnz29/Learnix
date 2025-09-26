'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClockIcon, AlertCircle, CheckCircle2, Users, Trophy, Home } from 'lucide-react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import QuizService from '../../../../services/quizService';

const LiveQuizPage = () => {
  const router = useRouter();
  const { id } = useParams();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [timeLeft, setTimeLeft] = useState(20);
  const [isAnswerLocked, setIsAnswerLocked] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [quizComplete, setQuizComplete] = useState(false);
  const [score, setScore] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [participants, setParticipants] = useState([]);

  const avatars = [
    { src: "/avatars/avatar1.png", id: 0 },
    { src: "/avatars/avatar2.png", id: 1 },
    { src: "/avatars/avatar3.png", id: 2 }
  ];

  // Fetch quiz from multiple sources
  useEffect(() => {
    const fetchQuiz = async () => {
      setLoading(true);
      setError(null);

      try {
        console.log("🔍 Fetching quiz with ID:", id);

        let quizData = null;

        // Method 1: Try localStorage first (for recently created quizzes)
        const storedQuiz = localStorage.getItem(`quiz_${id}`);
        if (storedQuiz) {
          console.log("💾 Loading from localStorage");
          quizData = JSON.parse(storedQuiz);
          
          // Set up user context for host
          setCurrentUser({
            id: 'host_current',
            name: quizData.hostName || 'Quiz Host',
            avatar: quizData.hostAvatar || 0,
            isHost: true
          });
          
          console.log("✅ Quiz loaded from localStorage:", quizData);
        }

        // Method 2: Try Firebase (if quiz was stored there)
        if (!quizData && !id.startsWith('local_')) {
          try {
            console.log("🔥 Trying Firebase...");
            quizData = await QuizService.getQuiz(id);
            console.log("✅ Quiz loaded from Firebase:", quizData);
          } catch (firebaseError) {
            console.log("❌ Firebase failed:", firebaseError.message);
          }
        }

        // Method 3: Try Node.js backend for extracted data
        if (!quizData) {
          try {
            console.log("🔍 Trying Node.js backend...");
            const res = await axios.get(`http://localhost:5000/api/upload/extracted/${id}`);
            
            if (res.data.success) {
              const extractedData = res.data.data;
              
              quizData = {
                id: extractedData.id,
                title: `Quiz from ${extractedData.filename}`,
                subject: extractedData.subject || 'General',
                difficulty: extractedData.difficulty || 'medium',
                duration: 20,
                questions: extractedData.questions || [],
                hostName: 'Quiz Host',
                hostAvatar: 0,
                metadata: extractedData.extractedMetadata,
                createdAt: extractedData.createdAt
              };
              
              console.log("✅ Quiz loaded from Node.js backend:", quizData);
            }
          } catch (nodeError) {
            console.log("❌ Node.js backend failed:", nodeError.message);
          }
        }

        // Method 4: Try Python backend directly (fallback)
        if (!quizData) {
          try {
            console.log("🐍 Trying Python backend...");
            const res = await axios.get(`http://localhost:8000/quiz/${id}`);
            
            if (res.data) {
              quizData = {
                id: id,
                title: res.data.title || 'Generated Quiz',
                questions: res.data.questions || [],
                participants: res.data.participants || []
              };
              
              console.log("✅ Quiz loaded from Python backend:", quizData);
            }
          } catch (pythonError) {
            console.log("❌ Python backend failed:", pythonError.message);
          }
        }

        if (!quizData) {
          throw new Error("Quiz not found in any backend. Please check the quiz ID or try creating a new quiz.");
        }

        // Transform questions to consistent format
        const transformedQuestions = (quizData.questions || []).map((q, idx) => {
          let questionText, options;

          if (typeof q === 'string') {
            questionText = q;
            options = [
              { id: 1, text: "True", isCorrect: true },
              { id: 2, text: "False", isCorrect: false }
            ];
          } else if (q.question || q.q) {
            questionText = q.question || q.q;
            
            if (q.options && Array.isArray(q.options)) {
              options = q.options.map((opt, optIdx) => ({
                id: optIdx + 1,
                text: opt.text || opt,
                isCorrect: opt.isCorrect || opt.correct || false
              }));
            } else if (q.answer || q.a) {
              const correctAnswer = q.answer || q.a;
              options = [
                { id: 1, text: correctAnswer, isCorrect: true },
                { id: 2, text: "Alternative answer", isCorrect: false },
                { id: 3, text: "Another option", isCorrect: false },
                { id: 4, text: "Different choice", isCorrect: false }
              ];
            } else {
              options = [
                { id: 1, text: "True", isCorrect: true },
                { id: 2, text: "False", isCorrect: false }
              ];
            }
          } else {
            questionText = JSON.stringify(q);
            options = [
              { id: 1, text: "Yes", isCorrect: true },
              { id: 2, text: "No", isCorrect: false }
            ];
          }

          return {
            id: idx + 1,
            text: questionText,
            options: options,
            timeLimit: q.timeLimit || 20,
            explanation: q.explanation || null
          };
        });

        // Set up participants (demo data + current user)
        const demoParticipants = [
          { id: 'player_1', name: 'Alice', avatar: 0, score: 0 },
          { id: 'player_2', name: 'Bob', avatar: 1, score: 0 },
          { id: 'player_3', name: 'Carol', avatar: 2, score: 0 },
        ];

        setParticipants(demoParticipants);

        const finalQuizData = {
          ...quizData,
          questions: transformedQuestions,
          participants: demoParticipants
        };

        setQuiz(finalQuizData);
        setTimeLeft(finalQuizData.questions[0]?.timeLimit || 20);
        
        console.log("🎯 Final quiz data:", finalQuizData);

        // Set default user if not set
        if (!currentUser) {
          setCurrentUser({
            id: 'current_user',
            name: 'Player',
            avatar: Math.floor(Math.random() * 3),
            isHost: false
          });
        }

      } catch (error) {
        console.error('❌ Error fetching quiz:', error);
        setError(`Failed to load quiz: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchQuiz();
    }
  }, [id, currentUser]);

  const currentQuestion = quiz?.questions[currentQuestionIndex];

  // Timer effect
  useEffect(() => {
    if (!quiz || !currentQuestion || quizComplete) return;
    
    if (timeLeft > 0 && !isAnswerLocked) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !isAnswerLocked) {
      handleTimeOut();
    }
  }, [timeLeft, isAnswerLocked, quiz, currentQuestion, quizComplete]);

  const handleTimeOut = () => {
    setIsAnswerLocked(true);
    if (!selectedOption) {
      setUserAnswers(prev => ({
        ...prev,
        [currentQuestionIndex]: {
          selected: null,
          correct: false,
          timeSpent: currentQuestion?.timeLimit || 20,
          selectedText: "No answer"
        }
      }));
    }
    
    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const handleOptionSelect = (optionId) => {
    if (isAnswerLocked || quizComplete) return;
    
    setSelectedOption(optionId);
    setIsAnswerLocked(true);

    const selectedOptionData = currentQuestion.options.find(opt => opt.id === optionId);
    const isCorrect = selectedOptionData?.isCorrect || false;
    
    setUserAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: {
        selected: optionId,
        correct: isCorrect,
        timeSpent: (currentQuestion?.timeLimit || 20) - timeLeft,
        selectedText: selectedOptionData?.text
      }
    }));

    if (isCorrect) {
      setScore(prev => prev + 1);
    }

    setTimeout(() => {
      nextQuestion();
    }, 2000);
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedOption(null);
      setIsAnswerLocked(false);
      setTimeLeft(quiz.questions[currentQuestionIndex + 1]?.timeLimit || 20);
    } else {
      setQuizComplete(true);
      setShowResults(true);
      saveQuizResults();
    }
  };

  const saveQuizResults = async () => {
    try {
      const attemptData = {
        participantName: currentUser?.name || "Quiz Taker",
        participantId: currentUser?.id || "user_" + Date.now(),
        participantAvatar: currentUser?.avatar || 0,
        answers: userAnswers,
        score: score,
        percentage: Math.round((score / quiz.questions.length) * 100),
        timeSpent: quiz.questions.reduce((total, q, idx) => {
          return total + (userAnswers[idx]?.timeSpent || q.timeLimit || 20);
        }, 0),
        questionResults: quiz.questions.map((q, idx) => ({
          questionId: q.id,
          questionText: q.text,
          userAnswer: userAnswers[idx]?.selectedText || "No answer",
          correctAnswer: q.options.find(opt => opt.isCorrect)?.text || "N/A",
          isCorrect: userAnswers[idx]?.correct || false,
          timeSpent: userAnswers[idx]?.timeSpent || 0
        })),
        startedAt: new Date(Date.now() - (quiz.questions.length * 20 * 1000)),
        submittedAt: new Date()
      };

      if (!id.startsWith('local_')) {
        try {
          await QuizService.storeQuizAttempt(id, attemptData);
          console.log("✅ Quiz results saved");
        } catch (saveError) {
          console.log("❌ Failed to save results:", saveError.message);
        }
      }

    } catch (error) {
      console.error("❌ Error saving results:", error);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setTimeLeft(quiz.questions[0]?.timeLimit || 20);
    setIsAnswerLocked(false);
    setUserAnswers({});
    setShowResults(false);
    setQuizComplete(false);
    setScore(0);
  };

  const goBackToLobby = () => {
    router.push(`/dashboard/lobby/${id}`);
  };

  const goToDashboard = () => {
    // Clean up stored data
    localStorage.removeItem(`quiz_${id}`);
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
          <p className="text-xl font-semibold">Loading Quiz...</p>
          <p className="text-sm text-white/60 mt-2">Preparing questions for you...</p>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white/10 backdrop-blur-lg p-8 rounded-2xl max-w-md border border-white/20"
        >
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Quiz Not Available</h2>
          <p className="text-white/80 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button 
              onClick={goBackToLobby}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition flex items-center gap-2"
            >
              <Users className="w-4 h-4" />
              Back to Lobby
            </button>
            <button 
              onClick={goToDashboard}
              className="px-6 py-3 bg-gray-500 hover:bg-gray-600 rounded-lg transition flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (!quiz || !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <p className="text-xl">No quiz data available</p>
          <button 
            onClick={goToDashboard}
            className="mt-4 px-6 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
          >
            Back to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }

  if (showResults) {
    const percentage = Math.round((score / quiz.questions.length) * 100);
    const grade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : percentage >= 60 ? 'D' : 'F';
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white font-sans p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 mx-auto mb-6 bg-green-500 rounded-full flex items-center justify-center">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold mb-4">Quiz Complete! 🎉</h1>
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 inline-block border border-white/20">
              <div className="text-6xl font-bold mb-2 text-yellow-400">{grade}</div>
              <p className="text-2xl font-semibold">{score} / {quiz.questions.length}</p>
              <p className="text-xl text-white/80">{percentage}% Correct</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20"
          >
            <h2 className="text-2xl font-bold mb-6 flex items-center">
              <CheckCircle2 className="w-6 h-6 mr-2 text-green-400" />
              Quiz Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
                <div className="text-3xl font-bold text-green-400 mb-2">{score}</div>
                <div className="text-sm text-green-300">Correct Answers</div>
              </div>
              <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
                <div className="text-3xl font-bold text-red-400 mb-2">{quiz.questions.length - score}</div>
                <div className="text-sm text-red-300">Incorrect</div>
              </div>
              <div className="bg-blue-500/20 border border-blue-500/30 rounded-xl p-4">
                <div className="text-3xl font-bold text-blue-400 mb-2">{quiz.questions.length}</div>
                <div className="text-sm text-blue-300">Total Questions</div>
              </div>
              <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
                <div className="text-3xl font-bold text-yellow-400 mb-2">{percentage}%</div>
                <div className="text-sm text-yellow-300">Final Score</div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex justify-center gap-4 flex-wrap"
          >
            <button 
              onClick={restartQuiz}
              className="px-8 py-3 bg-blue-500 hover:bg-blue-600 rounded-xl transition-colors flex items-center gap-2 font-semibold"
            >
              🔄 Retake Quiz
            </button>
            <button 
              onClick={goBackToLobby}
              className="px-8 py-3 bg-purple-500 hover:bg-purple-600 rounded-xl transition-colors flex items-center gap-2 font-semibold"
            >
              <Users className="w-5 h-5" />
              Back to Lobby
            </button>
            <button 
              onClick={goToDashboard}
              className="px-8 py-3 bg-gray-500 hover:bg-gray-600 rounded-xl transition-colors flex items-center gap-2 font-semibold"
            >
              <Home className="w-5 h-5" />
              Dashboard
            </button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white font-sans p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-between items-start mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold mb-1">{quiz.title || 'LearniX Quiz'}</h1>
          <div className="flex items-center gap-4 text-sm text-white/80">
            <span>Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
            {quiz.subject && <span>• {quiz.subject}</span>}
            <span>• Quiz ID: {id.slice(0, 8)}...</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {participants.slice(0, 3).map((participant, idx) => (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.1 }}
              className="relative"
            >
              <Image
                src={avatars[participant.avatar]?.src || "/avatars/avatar1.png"}
                alt={participant.name}
                width={40}
                height={40}
                className="rounded-full border-2 border-white/20"
              />
            </motion.div>
          ))}
          {participants.length > 3 && (
            <div className="w-10 h-10 rounded-full border-2 border-white/20 bg-white/10 flex items-center justify-center">
              <span className="text-xs font-semibold">+{participants.length - 3}</span>
            </div>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Quiz Area */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-3 bg-white/10 backdrop-blur-lg p-6 rounded-2xl border border-white/20"
        >
          {/* Question */}
          <motion.div
            key={currentQuestionIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-white/90 text-gray-800 p-6 rounded-2xl shadow-lg">
              <h2 className="text-xl font-semibold leading-relaxed">
                {currentQuestion.text}
              </h2>
            </div>
          </motion.div>
          
          {/* Options */}
          <div className="space-y-4">
            <AnimatePresence mode="wait">
              {currentQuestion.options.map((option, index) => {
                let buttonClass = "w-full flex items-center text-left px-6 py-4 rounded-xl transition-all duration-300 font-medium shadow-lg border-2 ";
                
                if (isAnswerLocked) {
                  if (option.isCorrect) {
                    buttonClass += "bg-green-500 border-green-400 text-white shadow-green-500/25 ";
                  } else if (selectedOption === option.id && !option.isCorrect) {
                    buttonClass += "bg-red-500 border-red-400 text-white shadow-red-500/25 ";
                  } else {
                    buttonClass += "bg-white/5 border-white/10 text-white/60 ";
                  }
                } else {
                  buttonClass += selectedOption === option.id 
                    ? "bg-blue-500 border-blue-400 text-white shadow-blue-500/25 transform scale-[1.02] " 
                    : "bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 hover:transform hover:scale-[1.01] ";
                }

                return (
                  <motion.button
                    key={option.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={isAnswerLocked}
                    className={buttonClass}
                  >
                    <span className="w-8 h-8 mr-4 flex items-center justify-center rounded-full bg-white text-black font-bold text-sm">
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="flex-1">{option.text}</span>
                    {isAnswerLocked && option.isCorrect && (
                      <CheckCircle2 className="w-6 h-6 ml-auto text-white" />
                    )}
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {currentQuestion.explanation && isAnswerLocked && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="mt-6 bg-blue-500/20 border border-blue-500/30 rounded-xl p-4"
              >
                <h3 className="font-semibold text-blue-300 mb-2 flex items-center">
                  💡 Explanation:
                </h3>
                <p className="text-sm text-white/90">{currentQuestion.explanation}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Timer */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 text-center py-6 rounded-2xl">
            <motion.div
              animate={{ 
                scale: timeLeft <= 5 ? [1, 1.1, 1] : 1,
                color: timeLeft <= 5 ? '#ef4444' : '#ffffff'
              }}
              transition={{ repeat: timeLeft <= 5 ? Infinity : 0, duration: 1 }}
              className="text-4xl font-bold mb-2"
            >
              {Math.floor(timeLeft / 60).toString().padStart(2, '0')} : {(timeLeft % 60).toString().padStart(2, '0')}
            </motion.div>
            <p className="text-sm text-white/70">Time Remaining</p>
            <div className="w-full bg-white/20 rounded-full h-2 mt-3">
              <motion.div 
                className={`h-2 rounded-full transition-all duration-1000 ${timeLeft <= 5 ? 'bg-red-500' : 'bg-blue-500'}`}
                style={{ width: `${(timeLeft / (currentQuestion?.timeLimit || 20)) * 100}%` }}
              />
            </div>
          </div>

          {/* Progress */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-2xl">
            <p className="mb-3 text-white/80 font-medium">Progress</p>
            <div className="w-full bg-white/20 rounded-full h-3 mb-3">
              <motion.div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-500" 
                style={{ width: `${((currentQuestionIndex + 1) / quiz.questions.length) * 100}%` }}
              />
            </div>
            <div className="text-sm text-white/70">
              {currentQuestionIndex + 1} of {quiz.questions.length} questions
            </div>
          </div>

          {/* Question Grid */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-2xl">
            <p className="mb-3 text-white/80 font-medium">Questions</p>
            <div className="grid grid-cols-5 gap-2 max-h-40 overflow-y-auto">
              {quiz.questions.map((_, idx) => {
                let className = "w-8 h-8 flex items-center justify-center rounded-lg font-semibold text-xs transition-all ";
                
                if (idx < currentQuestionIndex) {
                  className += userAnswers[idx]?.correct 
                    ? "bg-green-500 text-white shadow-lg " 
                    : "bg-red-500 text-white shadow-lg ";
                } else if (idx === currentQuestionIndex) {
                  className += "bg-yellow-400 text-black shadow-lg ring-2 ring-yellow-300 ";
                } else {
                  className += "bg-white/20 text-white/80 hover:bg-white/30 ";
                }

                return (
                  <motion.div 
                    key={idx} 
                    className={className}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {idx + 1}
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Score */}
          <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-4 rounded-2xl">
            <p className="mb-2 text-white/80 font-medium">Current Score</p>
            <div className="text-3xl font-bold text-green-400 mb-1">
              {score} / {currentQuestionIndex + (isAnswerLocked ? 1 : 0)}
            </div>
            <div className="text-sm text-white/60">
              {currentQuestionIndex > 0 ? Math.round((score / currentQuestionIndex) * 100) : 0}% Correct
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 mt-2">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-500" 
                style={{ width: `${currentQuestionIndex > 0 ? (score / currentQuestionIndex) * 100 : 0}%` }}
              />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LiveQuizPage;
