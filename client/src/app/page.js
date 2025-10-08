"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation'; // Add this import
import {
  Play,
  BookOpen,
  Users,
  Trophy,
  BarChart,
  MessageCircle,
  Send,
  Sparkles,
  ChevronRight,
  Star,
  CheckCircle,
  ArrowRight,
  Zap,
  Brain,
  Target
} from 'lucide-react';

export default function LearniXLanding() {
  const [activeFeature, setActiveFeature] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const router = useRouter(); // Add this

  const features = [
    { icon: Brain, title: "AI Quiz Generator", desc: "Transform any content into engaging quizzes instantly", color: "from-[#18DEA3] to-[#422cac]" },
    { icon: Trophy, title: "Live Competitions", desc: "Real-time multiplayer quiz battles with friends", color: "from-[#422cac] to-[#18DEA3]" },
    { icon: BarChart, title: "Smart Analytics", desc: "Deep insights into your learning progress", color: "from-[#18DEA3] to-[#422cac]" },
    { icon: Users, title: "Collaborative Learning", desc: "Learn together with friends and classmates", color: "from-[#422cac] to-[#18DEA3]" }
  ];

  const testimonials = [
    { name: "Sarah Chen", role: "Student", content: "LearniX transformed how I study. The AI quizzes are incredibly accurate!", rating: 5 },
    { name: "Mike Rodriguez", role: "Teacher", content: "My students love the competitive aspect. Engagement is through the roof!", rating: 5 },
    { name: "Emma Watson", role: "Professional", content: "Perfect for upskilling. The analytics help me track my progress perfectly.", rating: 5 }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [features.length]);

  // Add navigation functions
  const handleStartLearning = () => {
    router.push('/login');
  };

  const handleLearnMore = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#422cac] to-slate-900 text-white overflow-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/20 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-[#18DEA3] to-[#422cac] rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">LearniX</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <button className="text-white/70 hover:text-white transition">Pricing</button>
            <button className="text-white/70 hover:text-white transition">Features</button>
            <button className="text-white/70 hover:text-white transition">About</button>
            <button 
              onClick={handleStartLearning}
              className="bg-gradient-to-r from-[#18DEA3] to-[#422cac] px-4 py-2 rounded-full text-sm font-semibold hover:shadow-lg transition"
            >
              Start Learning →
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-3 text-center lg:text-left"
          >
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-6 border border-white/20">
              <Sparkles className="w-4 h-4 text-[#18DEA3]" />
              <span className="text-sm text-white/80">Unlock Your Learning Potential</span>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-bold mb-6">
              Fastest & Easiest Way to{' '}
              <span className="bg-gradient-to-r from-[#18DEA3] to-[#422cac] bg-clip-text text-transparent">
                Learn Anything
              </span>
            </h1>
            
            <p className="text-xl text-white/70 mb-8 leading-relaxed max-w-2xl">
              Generate unlimited quizzes at once with automatic AI assistance, 
              real-time competitions, and personalized learning paths.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                onClick={handleStartLearning}
                className="bg-gradient-to-r from-[#18DEA3] to-[#422cac] px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Start Learning
              </button>
              <button 
                onClick={handleLearnMore}
                className="border border-white/30 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300"
              >
                Learn More
              </button>
            </div>

            <div className="flex items-center gap-8 text-sm text-white/60">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#18DEA3]" />
                <span>AI Powered</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#18DEA3]" />
                <span>Real-time Battles</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-[#18DEA3]" />
                <span>Smart Analytics</span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2 relative"
          >
            <div className="relative bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20 shadow-2xl">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-[#18DEA3]" />
                <span className="text-base font-semibold">Turn Your Text into Quizzes</span>
              </div>
              
              <div className="space-y-3 mb-4">
                <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                  <label className="text-sm text-white/70 mb-1 block">Select quiz type</label>
                  <select className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white text-sm">
                    <option>Multiple Choice</option>
                  </select>
                </div>
                
                <div className="bg-white/10 rounded-lg p-3 border border-white/10">
                  <label className="text-sm text-white/70 mb-1 block">Write your prompt</label>
                  <textarea 
                    placeholder="Explain a quiz content or asking for topic. Generate questions from your materials..."
                    className="w-full bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-white placeholder-white/50 resize-none h-16 text-sm"
                  />
                </div>
              </div>

              <button 
                onClick={handleStartLearning}
                className="w-full bg-gradient-to-r from-[#18DEA3] to-[#422cac] px-4 py-3 rounded-lg font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Generate Quiz
              </button>

              {/* Mock Quiz Preview */}
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="bg-gradient-to-br from-[#18DEA3]/20 to-[#422cac]/20 rounded-lg p-2 border border-[#18DEA3]/30">
                  <div className="w-full h-12 bg-gradient-to-br from-[#18DEA3] to-[#422cac] rounded opacity-80"></div>
                  <p className="text-xs text-white/70 mt-1">Question 1</p>
                </div>
                <div className="bg-gradient-to-br from-[#422cac]/20 to-[#18DEA3]/20 rounded-lg p-2 border border-[#422cac]/30">
                  <div className="w-full h-12 bg-gradient-to-br from-[#422cac] to-[#18DEA3] rounded opacity-80"></div>
                  <p className="text-xs text-white/70 mt-1">Question 2</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-center gap-3 text-xs">
                <div className="flex items-center gap-1 text-white/60">
                  <div className="w-2 h-2 bg-[#18DEA3] rounded-full"></div>
                  <span>AI Generation</span>
                </div>
                <div className="flex items-center gap-1 text-white/60">
                  <div className="w-2 h-2 bg-[#422cac] rounded-full"></div>
                  <span>Real-time Analysis</span>
                </div>
              </div>
            </div>

            {/* Floating elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-[#18DEA3] to-[#422cac] rounded-full opacity-20 blur-xl"></div>
            <div className="absolute -bottom-4 -left-4 w-20 h-20 bg-gradient-to-r from-[#422cac] to-[#18DEA3] rounded-full opacity-20 blur-xl"></div>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-16"
          >
            <span className="text-[#18DEA3] text-sm font-semibold">— How it works —</span>
            <h2 className="text-5xl font-bold mt-4 mb-6">
              Turn ideas into{' '}
              <span className="bg-gradient-to-r from-[#18DEA3] to-[#422cac] bg-clip-text text-transparent">
                learning experiences
              </span>{' '}
              in seconds.
            </h2>
            <p className="text-white/70 text-xl max-w-3xl mx-auto">
              Create endless learning content instantly. Automatically generate 
              quizzes, track progress, compete with friends, and get AI assistance.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: "1", title: "Upload & Generate", desc: "Add your content or choose a topic. Our AI creates personalized quizzes instantly." },
              { step: "2", title: "Learn & Compete", desc: "Take quizzes solo or challenge friends in real-time multiplayer battles." },
              { step: "3", title: "Track & Improve", desc: "Get detailed analytics and AI recommendations to boost your learning." }
            ].map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="w-12 h-12 bg-gradient-to-r from-[#18DEA3] to-[#422cac] rounded-full flex items-center justify-center text-white font-bold text-lg mb-6 mx-auto">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-4">{item.title}</h3>
                <p className="text-white/70">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#18DEA3] text-sm font-semibold">— Features —</span>
            <h2 className="text-4xl font-bold mt-4 mb-6">
              Your go-to tool for crafting{' '}
              <span className="bg-gradient-to-r from-[#18DEA3] to-[#422cac] bg-clip-text text-transparent">
                engaging learning
              </span>{' '}
              using AI.
            </h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {features.map((feature, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  className={`p-6 rounded-2xl border transition-all duration-300 cursor-pointer ${
                    activeFeature === idx 
                      ? 'bg-gradient-to-r from-white/10 to-white/5 border-[#18DEA3]/50' 
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                  onClick={() => setActiveFeature(idx)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${feature.color} p-3 flex items-center justify-center`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold">{feature.title}</h3>
                      <p className="text-white/70 text-sm">{feature.desc}</p>
                    </div>
                    <ChevronRight className={`w-5 h-5 text-white/40 transition-transform ${activeFeature === idx ? 'rotate-90' : ''}`} />
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 shadow-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeFeature}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className={`w-full h-64 bg-gradient-to-br ${features[activeFeature].color} rounded-2xl opacity-80 flex items-center justify-center`}>
                      {/* <features[activeFeature].icon className="w-24 h-24 text-white/50" /> */}
                    </div>
                    <div className="mt-6">
                      <h3 className="text-xl font-semibold mb-2">{features[activeFeature].title}</h3>
                      <p className="text-white/70">{features[activeFeature].desc}</p>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#18DEA3] text-sm font-semibold">— Testimonials —</span>
            <h2 className="text-4xl font-bold mt-4 mb-6">
              Our User Stories:{' '}
              <span className="bg-gradient-to-r from-[#18DEA3] to-[#422cac] bg-clip-text text-transparent">
                How We Made an Impact
              </span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: idx * 0.2 }}
                className="bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-md rounded-2xl p-8 border border-white/10"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-[#18DEA3] fill-current" />
                  ))}
                </div>
                <p className="text-white/80 mb-6">{testimonial.content}</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-[#18DEA3] to-[#422cac] rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">{testimonial.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-white/60 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="bg-gradient-to-r from-[#18DEA3]/20 to-[#422cac]/20 backdrop-blur-md rounded-3xl p-12 border border-[#18DEA3]/30 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#18DEA3]/10 to-[#422cac]/10"></div>
            <div className="relative z-10">
              <h2 className="text-4xl font-bold mb-6">
                Experience the{' '}
                <span className="bg-gradient-to-r from-[#18DEA3] to-[#422cac] bg-clip-text text-transparent">
                  Magic
                </span>
              </h2>
              <p className="text-white/70 text-xl mb-8 max-w-2xl mx-auto">
                Join thousands of learners who are already transforming their education with AI-powered tools.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleStartLearning}
                  className="bg-gradient-to-r from-[#18DEA3] to-[#422cac] px-8 py-4 rounded-xl font-semibold text-lg hover:shadow-2xl transition-all duration-300"
                >
                  Start Free Trial
                </button>
                <button 
                  onClick={handleLearnMore}
                  className="border border-white/30 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-white/10 transition-all duration-300"
                >
                  Learn More →
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-8 h-8 bg-gradient-to-r from-[#18DEA3] to-[#422cac] rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">LearniX</span>
          </div>
          <p className="text-white/60 text-sm">© 2024 LearniX. All rights reserved.</p>
        </div>
      </footer>

      {/* Floating Action Button - Only Chat */}
      <motion.div 
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <button className="w-14 h-14 bg-gradient-to-r from-[#18DEA3] to-[#422cac] rounded-full shadow-2xl flex items-center justify-center text-white">
          <MessageCircle size={24} />
        </button>
      </motion.div>
    </div>
  );
}