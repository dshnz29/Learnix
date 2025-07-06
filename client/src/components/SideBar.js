"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  HomeIcon,
  PlusCircleIcon,
  LogInIcon,
  LayoutDashboardIcon,
  BookOpenIcon,
  HistoryIcon,
  TrophyIcon,
  MicIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navLinks = [
  { href: "/dashboard", icon: LayoutDashboardIcon, label: "Dashboard" },
  {
    href: "/dashboard/create-quiz",
    icon: PlusCircleIcon,
    label: "Create Quiz",
  },
  { href: "/dashboard/join-quiz", icon: LogInIcon, label: "Join Quiz" },
  { href: "/dashboard/explore", icon: BookOpenIcon, label: "Explore" },
  { href: "/dashboard/history", icon: HistoryIcon, label: "History" },
  { href: "/dashboard/leaderboard", icon: TrophyIcon, label: "Leaderboard" },
  { href: "/dashboard/voice-agent", icon: MicIcon, label: "Voice Learning" },
  { href: "/", icon: HomeIcon, label: "Home" },
];

const Sidebar = ({ isCollapsed, setIsCollapsed }) => {
  const pathname = usePathname();

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="p-4 flex flex-col gap-4 rounded-r-3xl shadow-xl border-r min-h-screen fixed z-50 overflow-hidden"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.06)",
        backdropFilter: "blur(16px)",
        borderColor: "rgba(255, 255, 255, 0.2)",
      }}
    >
      {/* Title & Toggle Button */}
      <div
        className="relative mb-8 flex justify-center items-center mt-5"
        style={{ height: 40 }}
      >
        {!isCollapsed ? (
          <h1 className="text-3xl font-extrabold text-white text-center">
            LearniX.
          </h1>
        ) : (
          <div style={{ height: "1rem" }} />
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-5 top-1/2 transform -translate-y-1/2 bg-white/20 text-white rounded-full p-1 hover:bg-white/30 backdrop-blur shadow-lg z-10"
          aria-label="Toggle Sidebar"
        >
          {isCollapsed ? <ChevronRight size={25} /> : <ChevronLeft size={25} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="space-y-1">
        {navLinks.map(({ href, icon: Icon, label }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center ${
                isCollapsed ? "justify-center" : "gap-4"
              } px-4 py-3 rounded-lg transition-colors cursor-pointer group text-[16px] ${
                isActive
                  ? "bg-teal-400 text-gray-900 font-semibold"
                  : "hover:bg-white/10 text-white/80"
              }`}
            >
              <Icon size={22} />
              {!isCollapsed && (
                <motion.span
                  initial={false}
                  animate={{ opacity: 1, width: "auto" }}
                  transition={{ duration: 0.4 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  {label}
                </motion.span>
              )}
            </Link>
          );
        })}
      </nav>
    </motion.aside>
  );
};

export default Sidebar;
