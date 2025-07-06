'use client';

import React, { useState } from 'react';
import { FaPlus, FaSearch, FaUpload, FaUsers } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function VoiceAgent() {
  const [sources, setSources] = useState([]);

  return (
    <div className="w-full h-[95vh] p-2 text-white flex gap-2 font-sans overflow-hidden">
      
      {/* Left Panel - Chat (Expanded) */}
      <motion.div
        className="w-3/4 h-full rounded-2xl bg-white/10 border border-white/20 shadow-inner backdrop-blur-xl flex flex-col p-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <h2 className="text-md font-semibold text-white mb-2">Chat</h2>
        <div className="flex-grow flex flex-col items-center justify-center text-white/80 gap-3">
          <FaUpload size={24} className="text-blue-400" />
          <p className="text-base">Add a source to get started</p>
          <button className="px-4 py-1 rounded-xl bg-[#111] hover:bg-[#1a1a1a] text-white text-sm border border-white/10">
            Upload a source
          </button>
        </div>
        <div className="mt-2 border border-white/10 rounded-xl p-2 flex justify-between items-center bg-[#111]/50">
          <input
            type="text"
            className="bg-transparent w-full outline-none text-sm text-white placeholder-white/40"
            placeholder="Upload a source to get started"
            disabled
          />
          <button className="ml-2 text-blue-400 bg-transparent">
            <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
              <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
            </svg>
          </button>
        </div>
      </motion.div>

      {/* Right Panel - Stacked Sources and Studio */}
      <div className="w-1/4 h-full flex flex-col gap-2">
        {/* Sources */}
        <motion.div
          className="flex-1 rounded-2xl bg-[#0b0b0b]/60 border border-white/10 shadow-inner backdrop-blur-xl flex flex-col p-2"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-md font-semibold text-white mb-2">Sources</h2>
          <div className="flex gap-1 mb-3">
            <button className="flex-1 bg-[#1e1e1e] hover:bg-[#2e2e2e] rounded-lg py-1 flex items-center justify-center gap-1 text-xs text-white border border-white/10">
              <FaPlus /> Add
            </button>
            <button className="flex-1 bg-[#1e1e1e] hover:bg-[#2e2e2e] rounded-lg py-1 flex items-center justify-center gap-1 text-xs text-white border border-white/10">
              <FaSearch /> Discover
            </button>
          </div>
          <div className="flex-grow flex items-center justify-center text-center text-xs text-white/60 px-2">
            <div>
              <p className="text-sm mb-1">Saved sources will appear here</p>
              <p>
                Click <strong>Add</strong> above to upload PDFs, text, audio, or links.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Studio */}
        <motion.div
          className="flex-1 rounded-2xl bg-[#0b0b0b]/60 border border-white/10 shadow-inner backdrop-blur-xl flex flex-col p-2"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-md font-semibold text-white mb-2">Studio</h2>

          {/* Audio Overview */}
          <div className="mb-2">
            <h3 className="text-white/80 mb-1 text-sm">Audio Overview</h3>
            <div className="rounded-lg p-2 bg-gradient-to-r from-indigo-600 to-green-500 text-white text-xs font-medium mb-2">
              🌍 Create an Audio Overview in more languages!
            </div>
            <div className="bg-[#1a1a1a] border border-white/10 rounded-lg p-2 mb-2">
              <div className="flex items-center justify-between mb-1">
                <div className="flex gap-2 items-center text-white">
                  <FaUsers />
                  <div>
                    <p className="text-sm">Deep Dive conversation</p>
                    <p className="text-xs text-white/60">Two hosts</p>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button className="bg-[#111] hover:bg-[#1f1f1f] px-2 py-1 rounded-md text-xs text-white/70 border border-white/10">
                    Customize
                  </button>
                  <button className="bg-[#222] hover:bg-[#333] px-2 py-1 rounded-md text-xs text-white/70 border border-white/10">
                    Generate
                  </button>
                </div>
              </div>
            </div>
          </div>

        </motion.div>
      </div>
    </div>
  );
}
