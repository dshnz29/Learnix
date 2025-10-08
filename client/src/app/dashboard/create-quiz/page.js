'use client';

import { motion, AnimatePresence } from "framer-motion";
import {
  FaMicrophone,
  FaCrown,
  FaHistory,
  FaRocket,
  FaPlus,
  FaHome,
  FaUsers,
  FaSpinner,
  FaCopy,
  FaUser,
  FaPlay
} from "react-icons/fa";
import { FileUpIcon, ArrowLeft, ArrowRight, Eye, FileText, Copy, CheckCircle } from 'lucide-react';
import Image from "next/image";
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { useRouter } from 'next/navigation';
import QuizService from '../../../services/quizService';
import singlePlayerService from '../../../services/singlePlayerService';
import { useAuth } from '../../../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth(); // Add this
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState("");
  const [visibility, setVisibility] = useState("Public");
  const [duration, setDuration] = useState(15);
  const [questionCount, setQuestionCount] = useState(10);
  const [gameMode, setGameMode] = useState("multiplayer"); // New game mode state
  const [error, setError] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(1);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [host, setHost] = useState("");
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState(null);
  const [extractedDataId, setExtractedDataId] = useState(null);
  const [quizId, setQuizId] = useState(null);
  const [firebaseEnabled, setFirebaseEnabled] = useState(true);
  
  // PDF Preview states
  const [pdfUrl, setPdfUrl] = useState(null);
  
  // Link sharing states
  const [shareableLink, setShareableLink] = useState("");
  const [linkCopied, setLinkCopied] = useState(false);
  
  const fileInputRef = useRef(null);

  const avatars = [
    { src: "/avatars/avatar1.png", id: 0 },
    { src: "/avatars/avatar2.png", id: 1 },
    { src: "/avatars/avatar3.png", id: 2 }
  ];

  // Generate quiz ID and shareable link when quiz is created - UPDATE THIS
  useEffect(() => {
    if (generatedQuiz && generatedQuiz.length > 0 && !quizId) {
      const newQuizId = uuidv4();
      setQuizId(newQuizId);
      
      // Only generate shareable link for multiplayer mode
      if (gameMode === "multiplayer") {
        const baseUrl = window.location.origin;
        const lobbyJoinLink = `${baseUrl}/dashboard/lobby/${newQuizId}/join`;
        setShareableLink(lobbyJoinLink);
        
        console.log("🆔 Generated Quiz ID:", newQuizId);
        console.log("🔗 Shareable join link:", lobbyJoinLink);
      }
    }
  }, [generatedQuiz, quizId, gameMode]);

  // Copy link to clipboard
  const copyLink = async () => {
    try {
      if (!shareableLink) {
        setError("No link available to copy");
        return;
      }
      await navigator.clipboard.writeText(shareableLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
      console.log("📋 Link copied to clipboard");
    } catch (err) {
      console.error('Failed to copy link:', err);
      setError("Failed to copy link");
    }
  };

  // Enhanced handleFileUpload with PDF preview
  const handleFileUpload = async (e) => {
    setError(null);
    setUploadSuccess(false);
    
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      
      // Validate file
      if (!selectedFile.type.includes("pdf")) {
        setError("Only PDF files are allowed");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("Max size is 10MB");
        return;
      }
      
      setFile(selectedFile);
      
      // Create PDF preview URL
      const fileUrl = URL.createObjectURL(selectedFile);
      setPdfUrl(fileUrl);
      
      setIsUploading(true);

      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("questionCount", questionCount.toString());
      formData.append("subject", subject);
      formData.append("difficulty", "medium");
      formData.append("gameMode", gameMode); // Add game mode to form data

      try {
        console.log("📤 Uploading file:", selectedFile.name);
        console.log("🎮 Game mode:", gameMode);
        
        const res = await fetch("http://localhost:5000/api/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        console.log("📥 Response:", data);

        if (data.success) {
          setGeneratedQuiz(data.data.quiz);
          setExtractedDataId(data.data.firebaseId);
          setUploadSuccess(true);
          setError(null);
          
          console.log("✅ Quiz generated successfully:", data.data.quiz);
          console.log("🔥 Firebase ID:", data.data.firebaseId);
          
          // Auto-advance to next step after success
          setTimeout(() => {
            // For single player mode, skip avatar selection and go directly to step 3
            if (gameMode === "singleplayer") {
              setStep(3);
            } else {
              setStep(2);
            }
          }, 3000);
        } else {
          setError(data.error || "Upload failed");
          console.error("❌ Upload failed:", data.error);
        }
      } catch (err) {
        console.error("❌ Upload error:", err);
        setError("Upload failed. Please check if backend is running.");
      } finally {
        setIsUploading(false);
      }
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const fakeEvent = {
        target: {
          files: files
        }
      };
      handleFileUpload(fakeEvent);
    }
  };

  // Clean up PDF URL when component unmounts or file changes
  const cleanupPdfUrl = () => {
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  // Enhanced createCompleteQuiz with single player service integration
  const createCompleteQuiz = async () => {
    if (!generatedQuiz || generatedQuiz.length === 0) {
      setError("No quiz questions available");
      return null;
    }

    if (!user?.uid) {
      setError("User not authenticated");
      return null;
    }

    try {
      console.log("🔥 Creating complete quiz...");
      console.log("🎮 Game mode:", gameMode);
      
      const quizData = {
        id: quizId,
        title: title || `Quiz from ${file?.name}` || 'Generated Quiz',
        subject: subject || "General",
        difficulty: "medium",
        visibility: visibility || "Public",
        duration: duration || 15,
        gameMode: gameMode,
        
        // User and player data
        userId: user.uid,
        playerName: name || user.displayName || user.email?.split('@')[0] || "Anonymous",
        playerAvatar: selectedAvatar || user.avatar || 1,
        
        questions: generatedQuiz,
        
        extractedData: extractedDataId ? {
          id: extractedDataId,
          filename: file?.name || 'unknown.pdf',
          fileSize: file?.size || 0,
          textLength: null,
          cleanedLength: null,
          pages: null,
          processingTime: null,
          fallbackUsed: false
        } : null
      };

      console.log("📊 Quiz data to save:", quizData);

      // Store quiz data in localStorage for access
      localStorage.setItem(`quiz_${quizId}`, JSON.stringify(quizData));

      try {
        let createdQuiz;
        if (gameMode === "singleplayer") {
          // Use the new single player service
          createdQuiz = await singlePlayerService.createSinglePlayerQuiz(quizData);
          console.log("✅ Single player quiz created:", createdQuiz.quizId);
          return { ...quizData, isLocal: false, backendId: createdQuiz.quizId };
        } else {
          // Use existing multiplayer service
          createdQuiz = await QuizService.createQuiz(quizData);
          console.log("✅ Multiplayer quiz created:", createdQuiz.id);
          return createdQuiz;
        }
      } catch (error) {
        if (error.message.includes("Firebase not initialized")) {
          setFirebaseEnabled(false);
          console.log("⚠️ Firebase not available, using local storage only");
          return { ...quizData, isLocal: true };
        }
        throw error;
      }
      
    } catch (error) {
      console.error("❌ Error creating quiz:", error);
      setError("Failed to create quiz: " + error.message);
      return null;
    }
  };

  // Start single player quiz function
  const startSinglePlayerQuiz = async () => {
    if (!quizId) {
      setError("Quiz ID not available");
      return;
    }

    try {
      // Create complete quiz first
      await createCompleteQuiz();
      
      // Clean up PDF URL before navigation
      cleanupPdfUrl();
      
      console.log("🎮 Starting single player quiz:", quizId);
      
      // Navigate directly to quiz page for single player
      router.push(`/dashboard/quiz/${quizId}`);
      
    } catch (error) {
      console.error("❌ Error starting single player quiz:", error);
      setError("Failed to start quiz: " + error.message);
    }
  };

  // Go to lobby function (for multiplayer)
  const goToLobby = async () => {
    if (!quizId) {
      setError("Quiz ID not available");
      return;
    }

    try {
      // Create complete quiz first
      await createCompleteQuiz();
      
      // Clean up PDF URL before navigation
      cleanupPdfUrl();
      
      console.log("🏠 Navigating to lobby:", quizId);
      
      // Navigate to lobby page
      router.push(`/dashboard/lobby/${quizId}`);
      
    } catch (error) {
      console.error("❌ Error navigating to lobby:", error);
      setError("Failed to create lobby: " + error.message);
    }
  };

  const slideLeft = () => {
    setSelectedAvatar((prev) => (prev === 0 ? avatars.length - 1 : prev - 1));
  };

  const slideRight = () => {
    setSelectedAvatar((prev) => (prev === avatars.length - 1 ? 0 : prev + 1));
  };

  // PDF Preview Component
  const PDFPreview = () => {
    if (!pdfUrl) {
      return (
        <div className="flex items-center justify-center h-full text-white/40">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-white/30" />
            <p className="text-sm">Upload a PDF to see preview</p>
          </div>
        </div>
      );
    }

    return (
      <div className="h-full">
        <iframe
          src={pdfUrl}
          className="w-full h-full rounded-lg"
          title="PDF Preview"
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-cover text-white font-sans">
      <main className="flex-1 p-8">
        <AnimatePresence mode="wait">
          {step === 1 ? (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="max-w-5xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl"
            >
              
              {!firebaseEnabled && (
                <div className="bg-yellow-500/20 border border-yellow-500/50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-yellow-200">
                    ⚠️ Firebase not configured - running in local mode
                  </p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  {/* Game Mode Selection */}
                  <div className="mb-6">
                    <label className="block text-sm mb-3">Game Mode</label>
                    <div className="grid grid-cols-2 gap-4">
                      <label
                        className={`cursor-pointer p-4 rounded-lg border transition-all ${
                          gameMode === "singleplayer"
                            ? 'border-[#18DEA3]/50 bg-[#18DEA3]/10'
                            : 'border-white/20 bg-white/5 hover:border-white/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="gameMode"
                          value="singleplayer"
                          checked={gameMode === "singleplayer"}
                          onChange={(e) => setGameMode(e.target.value)}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <FaUser className="text-2xl mx-auto mb-2 text-[#18DEA3]" />
                          <span className="block text-white font-medium">Single Player</span>
                          <span className="text-xs text-white/60">Play alone, practice mode</span>
                        </div>
                      </label>

                      <label
                        className={`cursor-pointer p-4 rounded-lg border transition-all ${
                          gameMode === "multiplayer"
                            ? 'border-[#18DEA3]/50 bg-[#18DEA3]/10'
                            : 'border-white/20 bg-white/5 hover:border-white/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="gameMode"
                          value="multiplayer"
                          checked={gameMode === "multiplayer"}
                          onChange={(e) => setGameMode(e.target.value)}
                          className="sr-only"
                        />
                        <div className="text-center">
                          <FaUsers className="text-2xl mx-auto mb-2 text-[#18DEA3]" />
                          <span className="block text-white font-medium">Multiplayer</span>
                          <span className="text-xs text-white/60">Host a game for others</span>
                        </div>
                      </label>
                    </div>
                  </div>

                  <label className="block text-sm mb-2">Upload PDF Material</label>
                  <div 
                    className="border border-dashed border-white/30 rounded-xl p-6 text-center bg-white/5"
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <FaSpinner className="mx-auto mb-2 w-10 h-10 text-lime-300 animate-spin" />
                        <p className="text-sm text-lime-300">Processing PDF...</p>
                        <p className="text-xs text-white/40 mt-1">
                          Generating questions for {gameMode} mode
                        </p>
                      </div>
                    ) : uploadSuccess ? (
                      <div className="flex flex-col items-center">
                        <div className="mx-auto mb-2 w-10 h-10 text-green-400 flex items-center justify-center">✅</div>
                        <p className="text-sm text-green-400">Quiz generated successfully!</p>
                        <p className="text-xs text-white/40 mt-1">{generatedQuiz?.length || 0} questions created</p>
                        <p className="text-xs text-blue-300 mt-1">
                          🎮 Mode: {gameMode === "singleplayer" ? "Single Player" : "Multiplayer"}
                        </p>
                        {file && (
                          <p className="text-xs text-blue-300 mt-1">📄 {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</p>
                        )}
                        {quizId && (
                          <p className="text-xs text-green-400 mt-1">🆔 Quiz ID: {quizId.slice(0, 8)}...</p>
                        )}
                        {extractedDataId && firebaseEnabled && (
                          <p className="text-xs text-blue-400 mt-1">🔥 Stored in Firebase: {extractedDataId.slice(0, 8)}...</p>
                        )}
                      </div>
                    ) : (
                      <>
                        <FileUpIcon className="mx-auto mb-2 w-10 h-10 text-white/50" />
                        <p className="text-sm">
                          Drag and Drop a PDF file or{' '}
                          <label className="underline cursor-pointer text-lime-300">
                            browse
                            <input 
                              ref={fileInputRef}
                              type="file" 
                              accept=".pdf" 
                              className="hidden" 
                              onChange={handleFileUpload}
                              disabled={isUploading}
                            />
                          </label>
                        </p>
                        <p className="text-xs text-white/40 mt-1">PDF files up to 10mb</p>
                      </>
                    )}
                    
                    {file && !isUploading && !uploadSuccess && (
                      <p className="text-sm text-lime-300 mt-2">Selected: {file.name}</p>
                    )}
                    {error && (
                      <p className="text-sm text-red-400 mt-2">{error}</p>
                    )}
                  </div>

                  <div className="mt-6">
                    <label className="block mb-1 text-sm">Subject</label>
                    <input 
                      type="text" 
                      value={subject} 
                      onChange={(e) => setSubject(e.target.value)} 
                      placeholder="Enter Subject" 
                      className="w-full p-2 rounded-md bg-white/10 border border-white/20 placeholder-white/50 text-white focus:outline-none" 
                      disabled={isUploading}
                    />
                  </div>

                  {/* Show visibility only for multiplayer */}
                  {gameMode === "multiplayer" && (
                    <div className="mt-4">
                      <label className="block mb-1 text-sm">Visibility</label>
                      <select 
                        value={visibility} 
                        onChange={(e) => setVisibility(e.target.value)} 
                        className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-white"
                        disabled={isUploading}
                      >
                        <option value="Public">Public</option>
                        <option value="Private">Private</option>
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block mb-1 text-sm">Duration (minutes)</label>
                      <input 
                        type="number" 
                        value={duration} 
                        onChange={(e) => setDuration(parseInt(e.target.value))} 
                        min="5" 
                        className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-white" 
                        disabled={isUploading}
                      />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm">No. of Questions</label>
                      <input 
                        type="number" 
                        value={questionCount} 
                        onChange={(e) => setQuestionCount(parseInt(e.target.value))} 
                        min="5" 
                        max="20"
                        className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-white" 
                        disabled={isUploading}
                      />
                    </div>
                  </div>
                </div>
                
                {/* PDF Preview area */}
                <div className="bg-white/10 border border-white/20 rounded-xl min-h-[400px] flex flex-col">
                  <div className="px-4 py-3 border-b border-white/20">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Eye className="w-5 h-5 mr-2" />
                      PDF Preview
                    </h3>
                  </div>

                  <div className="flex-1 p-4">
                    <div className="h-full border border-white/10 rounded-lg overflow-hidden">
                      <PDFPreview />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end mt-6">
                <button 
                  onClick={() => {
                    if (gameMode === "singleplayer") {
                      setStep(3); // Skip avatar selection for single player
                    } else {
                      setStep(2); // Go to avatar selection for multiplayer
                    }
                  }}
                  className="bg-white/20 px-6 py-2 rounded-lg hover:bg-white/30 text-white font-semibold transition-opacity duration-300 disabled:opacity-50"
                  disabled={!uploadSuccess || isUploading}
                >
                  {isUploading ? "Processing..." : "Next"}
                </button>
              </div>
            </motion.div>
          ) : step === 2 && gameMode === "multiplayer" ? (
            <motion.div
              key="step2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="bg-white/10 backdrop-blur-lg p-6 rounded-xl shadow-md border border-white/20 flex flex-col items-center justify-center max-w-5xl mx-auto"
            >
              <h2 className="text-2xl font-semibold mb-6">Choose the Avatar</h2>
              <div className="flex items-center justify-center gap-6 w-full">
                <button onClick={slideLeft} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
                  <ArrowLeft className="w-6 h-6 text-white" />
                </button>
                <div className="relative w-[350px] h-[350px] flex justify-center items-center overflow-hidden">
                  <AnimatePresence mode="popLayout">
                    <motion.div
                      key={avatars[selectedAvatar].id}
                      initial={{ opacity: 0, scale: 0.9, x: 50 }}
                      animate={{ opacity: 1, scale: 1.2, x: 0 }}
                      exit={{ opacity: 0, scale: 0.9, x: -50 }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="absolute"
                    >
                      <Image
                        src={avatars[selectedAvatar].src}
                        alt={`Avatar ${selectedAvatar + 1}`}
                        width={500}
                        height={500}
                      />
                    </motion.div>
                  </AnimatePresence>
                </div>
                <button onClick={slideRight} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
                  <ArrowRight className="w-6 h-6 text-white" />
                </button>
              </div>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name.."
                className="mt-6 px-4 py-2 rounded-full bg-white/20 text-white placeholder:text-white/70 focus:outline-none"
              />
              <div className="flex justify-between w-full mt-6 px-4">
                <button onClick={() => setStep(1)} className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition">Back</button>
                <button onClick={() => setStep(3)} className="px-6 py-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition">Next</button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className="max-w-5xl mx-auto bg-white/10 backdrop-blur-md rounded-2xl p-6 shadow-xl"
            >
              <h2 className="text-2xl font-semibold text-white mb-6">
                {gameMode === "singleplayer" ? "Single Player Quiz Ready" : "Quiz Setup Complete"}
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                {/* Quiz Details */}
                <div className="bg-white/10 border border-white/30 rounded-lg p-6">
                  <h3 className="text-white text-xl mb-4 flex items-center">
                    <FileText className="w-6 h-6 mr-2" />
                    Quiz Details
                  </h3>
                  {generatedQuiz && (
                    <div className="text-white/70 space-y-3">
                      <div className="flex justify-between">
                        <span>🎮 Mode:</span>
                        <span className="text-white font-medium capitalize">
                          {gameMode === "singleplayer" ? "Single Player" : "Multiplayer"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>📝 Questions:</span>
                        <span className="text-white font-medium">{generatedQuiz.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>📚 Subject:</span>
                        <span className="text-white font-medium">{subject || "General"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>⏱️ Duration:</span>
                        <span className="text-white font-medium">{duration} minutes</span>
                      </div>
                      <div className="flex justify-between">
                        <span>🔥 Mode:</span>
                        <span className="text-white font-medium">{firebaseEnabled ? 'Online' : 'Local'}</span>
                      </div>
                      {file && (
                        <div className="flex justify-between">
                          <span>📄 Source:</span>
                          <span className="text-white font-medium text-sm">{file.name}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Settings & Actions */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white mb-1">Quiz Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-3 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/70"
                      placeholder={`Quiz from ${file?.name || 'PDF'}`}
                    />
                  </div>
                  
                  {gameMode === "singleplayer" && (
                    <div>
                      <label className="block text-sm text-white mb-1">Player Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full p-3 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/70"
                        placeholder="Your Name"
                      />
                    </div>
                  )}
                  
                  {gameMode === "multiplayer" && (
                    <>
                      <div>
                        <label className="block text-sm text-white mb-1">Host Name</label>
                        <input
                          type="text"
                          value={host}
                          onChange={(e) => setHost(e.target.value)}
                          className="w-full p-3 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/70"
                          placeholder={name || "Your Name"}
                        />
                      </div>
                      
                      {/* Share Link Section - Only for multiplayer */}
                      <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                        <h4 className="text-white font-medium mb-3 flex items-center">
                          <Copy className="w-4 h-4 mr-2" />
                          Share Quiz Link
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          <input
                            type="text"
                            value={shareableLink || "Generating link..."}
                            readOnly
                            className="flex-1 p-2 text-xs bg-white/10 border border-white/20 rounded text-white/80 font-mono"
                          />
                          <button
                            onClick={copyLink}
                            disabled={!shareableLink}
                            className="px-3 py-2 bg-blue-500 hover:bg-blue-600 rounded transition flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {linkCopied ? (
                              <>
                                <CheckCircle className="w-4 h-4" />
                                <span className="text-xs">Copied!</span>
                              </>
                            ) : (
                              <>
                                <FaCopy className="w-3 h-3" />
                                <span className="text-xs">Copy</span>
                              </>
                            )}
                          </button>
                        </div>
                        <p className="text-xs text-white/60">
                          Share this link with players to let them join your quiz lobby
                        </p>
                        {shareableLink && (
                          <div className="mt-3 p-2 bg-green-500/20 border border-green-500/50 rounded text-xs text-green-300">
                            ✅ Lobby link ready! Share with your players.
                          </div>
                        )}
                      </div>
                    </>
                  )}
                  
                  {/* Quiz ID Display */}
                  <div className="bg-white/10 border border-white/20 rounded-lg p-4">
                    <h4 className="text-sm font-medium text-white mb-2">Quiz ID</h4>
                    <p className="text-sm font-mono text-blue-300 break-all">
                      {quizId || "Generating..."}
                    </p>
                    <p className="text-xs text-white/60 mt-1">
                      {gameMode === "singleplayer" 
                        ? "Your unique quiz session ID" 
                        : "Players can also join using this ID directly"
                      }
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-center items-center mt-8 gap-4">
                {gameMode === "singleplayer" ? (
                  <button
                    onClick={startSinglePlayerQuiz}
                    className="px-10 py-3 bg-emerald-400 text-black font-semibold rounded-full hover:bg-emerald-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={!generatedQuiz || generatedQuiz.length === 0}
                  >
                    <FaPlay className="text-lg" />
                    Start Quiz ({generatedQuiz?.length || 0} questions)
                  </button>
                ) : (
                  <button
                    onClick={goToLobby}
                    className="px-10 py-3 bg-emerald-400 text-black font-semibold rounded-full hover:bg-emerald-300 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    disabled={!generatedQuiz || generatedQuiz.length === 0}
                  >
                    <FaUsers className="text-lg" />
                    Go to Lobby ({generatedQuiz?.length || 0} questions ready)
                  </button>
                )}
              </div>
              
              {error && (
                <p className="text-red-400 text-center mt-4 text-sm">{error}</p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}