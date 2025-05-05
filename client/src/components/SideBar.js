'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  HomeIcon,
  PlusCircleIcon,
  LogInIcon,
  LayoutDashboardIcon,
  BookOpenIcon,
  HistoryIcon,
  TrophyIcon,
  MicIcon
} from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="w-64 bg-white shadow-lg min-h-screen p-4">
      <div className="flex items-center justify-center mb-8 mt-4">
        <h1 className="text-2xl font-bold text-indigo-600">QuizMaster</h1>
      </div>
      <nav className="space-y-2">
        <NavItem href="/dashboard" icon={<LayoutDashboardIcon size={18} />} label="Dashboard" />
        <NavItem href="/dashboard/create-quiz" icon={<PlusCircleIcon size={18} />} label="Create Quiz" />
        <NavItem href="/dashboard/join-quiz" icon={<LogInIcon size={18} />} label="Join Quiz" />
        <NavItem href="/dashboard/explore" icon={<BookOpenIcon size={18} />} label="Explore" />
        <NavItem href="/dashboard/history" icon={<HistoryIcon size={18} />} label="History" />
        <NavItem href="/dashboard/leaderboard" icon={<TrophyIcon size={18} />} label="Leaderboard" />
        <NavItem href="/dashboard/voice-learning" icon={<MicIcon size={18} />} label="Voice Learning" />
        <NavItem href="/" icon={<HomeIcon size={18} />} label="Home" />
      </nav>
    </div>
  );
};

const NavItem = ({ href, icon, label }) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors ${isActive ? 'bg-indigo-50 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
};

export default Sidebar;
