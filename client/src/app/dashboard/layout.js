'use client';

import Sidebar from '../../components/SideBar';
import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const hideSidebar = pathname.startsWith('/dashboard/quiz');

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  const sidebarWidth = hideSidebar ? 0 : isCollapsed ? 80 : 260;

  return (
    <>
      <AnimatePresence>
        {isLoading && (
          <motion.div
            key="loader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-[#2b9ab0] via-[#124077] to-[#2b2477]"
          >
            <motion.h1
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [0.5, 1.1, 1], opacity: 1 }}
              transition={{
                duration: 1.6,
                ease: [0.2, 0.8, 0.2, 1],
              }}
              className="text-[50px] md:text-[70px] font-black text-white tracking-tight"
            >
              <motion.span
                animate={{ color: ['#ffffff', '#00f5d4', '#ffffff'] }}
                transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
              >
                LearniX.
              </motion.span>
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      {!isLoading && (
        <div
          className="flex min-h-screen bg-cover bg-center transition-colors duration-500"
          style={{
            backgroundImage: 'var(--background-image)',
            backgroundColor: 'var(--background)',
          }}
        >
          {!hideSidebar && (
            <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
          )}

          {/* 💡 use inline style for dynamic margin */}
          <main
            style={{
              marginLeft: `${sidebarWidth}px`,
              transition: 'margin-left 0.4s ease-in-out',
            }}
            className="flex-1 p-6"
          >
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="absolute top-6 right-6 z-50 p-2 rounded-full bg-white/30 dark:bg-white/10 backdrop-blur shadow-md"
              aria-label="Toggle Theme"
            >
              {darkMode ? '🎨' : '🎨'}
            </button>

            {children}
          </main>
        </div>
      )}
    </>
  );
}
