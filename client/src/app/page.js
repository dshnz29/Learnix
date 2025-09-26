'use client';

import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  RocketIcon,
  UsersIcon,
  TrophyIcon,
  BarChartIcon,
  MicIcon,
  MessageCircleIcon,
  SendIcon
} from 'lucide-react';
import Typed from 'typed.js';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

const Hero3D = dynamic(() => import('../components/Hero3d'), { ssr: false });

export default function LandingPage() {
  const typedRef = useRef(null);

  useEffect(() => {
    const typed = new Typed(typedRef.current, {
      strings: ['AI Tutor.', 'Real-time Quiz Battles.', 'Performance Tracking.', 'Voice Assistant.'],
      typeSpeed: 50,
      backSpeed: 30,
      loop: true,
    });
    return () => typed.destroy();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f25] via-[#10194e] to-[#071322] text-white">
      {/* 3D Hero Background */}
      <div className="relative w-full h-screen overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Hero3D />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <motion.h1 
            className="text-5xl md:text-6xl font-bold neon-text mb-4"
            initial={{ opacity: 0, y: -50 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1 }}
          >
            Welcome to LearniX
          </motion.h1>

          <span ref={typedRef} className="text-xl text-cyan-300 font-medium"></span>

          {/* 🔹 New Small Description Below Typed Text */}
          <p className="mt-4 text-white/70 max-w-xl text-base md:text-lg">
            Dive into a smarter way to learn with AI-generated quizzes, real-time voice support, and interactive score analysis. Designed to make learning fun, fast, and futuristic.
          </p>

          <motion.div 
            className="mt-8 flex gap-4"
            initial={{ opacity: 0, y: 30 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 1.2 }}
          >
            <Link href="/login" className="bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-xl shadow-xl text-white font-semibold">Sign In</Link>
            <Link href="/register" className="border border-cyan-500 text-cyan-400 hover:bg-cyan-600 hover:text-white px-6 py-3 rounded-xl transition">Register</Link>
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto py-24 px-6">
        <h2 className="text-3xl font-bold text-center neon-text mb-12">Features</h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8 }}
        >
          <FeatureCard icon={<RocketIcon className="text-cyan-400 w-8 h-8" />} title="AI Quiz Generator" desc="Generate quizzes from PDFs using advanced AI." />
          <FeatureCard icon={<TrophyIcon className="text-yellow-400 w-8 h-8" />} title="Leaderboard & Podium" desc="Visualize top scorers with 3D avatars and podiums." />
          <FeatureCard icon={<BarChartIcon className="text-green-400 w-8 h-8" />} title="Smart Scorecard" desc="Detailed stats and weak-point analysis." />
          <FeatureCard icon={<UsersIcon className="text-purple-400 w-8 h-8" />} title="Multiplayer Battles" desc="Challenge friends in real-time live quizzes." />
          <FeatureCard icon={<MicIcon className="text-red-400 w-8 h-8" />} title="Voice Assistant" desc="Get spoken help, quiz tips, and navigation support." />
          <FeatureCard icon={<MessageCircleIcon className="text-cyan-300 w-8 h-8" />} title="Chatbot" desc="Ask questions, get help, or explore with AI chat." />
        </motion.div>
      </section>

      {/* Feedback Section */}
      <section className="max-w-3xl mx-auto px-6 py-20">
        <motion.div 
          className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-xl"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h3 className="text-2xl font-bold neon-text mb-4">We value your feedback 💬</h3>
          <form className="space-y-4">
            <input type="text" placeholder="Your Name" className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            <input type="email" placeholder="Your Email" className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500" />
            <textarea rows={4} placeholder="Your Message" className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-cyan-500"></textarea>
            <button type="submit" className="flex items-center gap-2 bg-cyan-600 hover:bg-cyan-700 px-6 py-3 rounded-xl text-white font-semibold shadow-md">
              <SendIcon size={18} /> Submit Feedback
            </button>
          </form>
        </motion.div>
      </section>

      {/* Call to Action */}
      <section className="py-16 border-t border-white/10 text-center px-4">
        <motion.h2 className="text-4xl font-bold neon-text mb-4"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Ready to Level Up?
        </motion.h2>
        <p className="text-white/60 mb-6">Join now and unlock your learning superpowers with LearniX.</p>
        <Link href="/register" className="bg-cyan-600 hover:bg-cyan-700 transition text-white font-semibold py-3 px-6 rounded-xl shadow-xl">
          Get Started
        </Link>
      </section>

      {/* Chatbot Bubble */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="w-14 h-14 bg-cyan-500 hover:bg-cyan-600 rounded-full shadow-xl flex items-center justify-center text-white animate-bounce">
          <MessageCircleIcon size={28} />
        </button>
      </div>

      {/* Voice Assistant Bubble */}
      <div className="fixed bottom-6 left-6 z-50">
        <button className="w-14 h-14 bg-pink-500 hover:bg-pink-600 rounded-full shadow-xl flex items-center justify-center text-white animate-pulse">
          <MicIcon size={26} />
        </button>
      </div>

      {/* Footer */}
      <footer className="text-center py-6 text-white/50 text-sm border-t border-white/10">
        © {new Date().getFullYear()} LearniX. All rights reserved.
      </footer>
    </div>
  );
}

// Feature Card
const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6 shadow-lg hover:scale-[1.02] transition duration-300">
    <div className="flex items-center gap-4 mb-4">
      {icon}
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <p className="text-sm text-white/70">{desc}</p>
  </div>
);
