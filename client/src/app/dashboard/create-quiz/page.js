'use client';

import { motion, AnimatePresence } from "framer-motion";
import {
  FaMicrophone,
  FaCrown,
  FaHistory,
  FaRocket,
  FaPlus,
  FaHome,
  FaUsers
} from "react-icons/fa";
import { FileUpIcon, ArrowLeft, ArrowRight } from 'lucide-react';
import Image from "next/image";
import { useState } from "react";
import { v4 as uuidv4 } from 'uuid'; // ✅ UUID import

export default function Dashboard() {
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [subject, setSubject] = useState("");
  const [visibility, setVisibility] = useState("Public");
  const [duration, setDuration] = useState(15);
  const [questionCount, setQuestionCount] = useState(10);
  const [error, setError] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState(1);
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [host, setHost] = useState("");

  const avatars = [
    { src: "/avatars/avatar1.png", id: 0 },
    { src: "/avatars/avatar2.png", id: 1 },
    { src: "/avatars/avatar3.png", id: 2 }
  ];

  const handleFileUpload = (e) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (!selectedFile.type.includes("pdf")) {
        setError("Only PDF files are allowed");
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError("Max size is 10MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const slideLeft = () => {
    setSelectedAvatar((prev) => (prev === 0 ? avatars.length - 1 : prev - 1));
  };

  const slideRight = () => {
    setSelectedAvatar((prev) => (prev === avatars.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="min-h-screen flex  bg-cover text-white font-sans">
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
              <h1 className="text-2xl font-bold mb-6">Create New Quiz</h1>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm mb-2">Upload PDF Material</label>
                  <div className="border border-dashed border-white/30 rounded-xl p-6 text-center bg-white/5">
                    <FileUpIcon className="mx-auto mb-2 w-10 h-10 text-white/50" />
                    <p className="text-sm">
                      Drag and Drop a PDF file or <label className="underline cursor-pointer text-lime-300">browse<input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} /></label>
                    </p>
                    <p className="text-xs text-white/40 mt-1">PDF files up to 10mb</p>
                    {file && <p className="text-sm text-lime-300 mt-2">Selected: {file.name}</p>}
                    {error && <p className="text-sm text-red-400 mt-2">{error}</p>}
                  </div>

                  <div className="mt-6">
                    <label className="block mb-1 text-sm">Subject</label>
                    <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Enter Subject" className="w-full p-2 rounded-md bg-white/10 border border-white/20 placeholder-white/50 text-white focus:outline-none" />
                  </div>

                  <div className="mt-4">
                    <label className="block mb-1 text-sm">Visibility</label>
                    <select value={visibility} onChange={(e) => setVisibility(e.target.value)} className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-white">
                      <option value="Public">Public</option>
                      <option value="Private">Private</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block mb-1 text-sm">Duration</label>
                      <input type="number" value={duration} onChange={(e) => setDuration(parseInt(e.target.value))} min="5" className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-white" />
                    </div>
                    <div>
                      <label className="block mb-1 text-sm">No. of Questions</label>
                      <input type="number" value={questionCount} onChange={(e) => setQuestionCount(parseInt(e.target.value))} min="5" className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-white" />
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 border border-white/20 rounded-xl min-h-[400px]" />
              </div>
              <div className="flex justify-end mt-6">
                <button onClick={() => setStep(2)} className="bg-white/20 px-6 py-2 rounded-lg hover:bg-white/30 text-white font-semibold transition-opacity duration-300">Next</button>
              </div>
            </motion.div>
          ) : step === 2 ? (
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
              <h2 className="text-2xl font-semibold text-white mb-6">Waiting Room</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="col-span-2">
                  <div className="bg-white/10 border border-white/30 rounded-lg p-4 min-h-[300px]">
                    <h3 className="text-white text-lg mb-2">Participants</h3>
                  </div>
                  <div className="mt-4 bg-white/10 p-3 rounded-lg text-sm text-white/70">
                    https://www.figma.com/design/58eMHIMtkr8ae6gdOMJNtw/LearniX?node-id=0-1&amp;p
                    <span className="block mt-1 text-right text-xs">Join quiz using this URL</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-white mb-1">Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/70"
                      placeholder="Quiz Title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white mb-1">Host Name</label>
                    <input
                      type="text"
                      value={host}
                      onChange={(e) => setHost(e.target.value)}
                      className="w-full p-2 rounded-md bg-white/10 border border-white/20 text-white placeholder:text-white/70"
                      placeholder="Your Name"
                    />
                  </div>
                  <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-md font-medium">Generate</button>
                </div>
              </div>
              <div className="flex justify-center mt-6">
                <button
                  onClick={() => {
                    const quizId = uuidv4(); // ✅ Safe unique ID
                    window.open(`/dashboard/quiz/${quizId}`, '_blank');
                  }}
                  className="px-10 py-2 bg-emerald-400 text-black font-semibold rounded-full hover:bg-emerald-300 transition"
                >
                  Start
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
