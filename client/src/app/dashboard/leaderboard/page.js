"use client"
import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";

const leaderboardData = [
  {
    name: "Vadomand",
    points: 1744,
    rank: 1,
    avatar: "/avatars/avatar1.png", // Use actual 3D-style images
  },
  {
    name: "Halid_Morder",
    points: 1327,
    rank: 2,
    avatar: "/avatars/avatar2.png",
  },
  {
    name: "Halid_Morder",
    points: 1179,
    rank: 3,
    avatar: "/avatars/avatar3.png",
  },
  {
    name: "Madelyn Dias",
    points: 590,
    avatar: "/avatars/avatar4.png",
  },
  {
    name: "Zain Vaccaro",
    points: 448,
    avatar: "/avatars/avatar5.png",
  },
  {
    name: "Skylar Geidt",
    points: 448,
    avatar: "/avatars/avatar6.png",
  },
];

const Podium = () => {
  const top3 = leaderboardData.slice(0, 3);

  const styles = [
    {
      rankColor: "from-blue-600 to-blue-400",
      ring: "ring-blue-400",
      bg: "bg-blue-900/30",
    },
    {
      rankColor: "from-red-600 to-red-400",
      ring: "ring-red-400",
      bg: "bg-red-900/30",
    },
    {
      rankColor: "from-green-600 to-green-400",
      ring: "ring-green-400",
      bg: "bg-green-900/30",
    },
  ];

  return (
    <div className="flex justify-center gap-12 items-end mt-8">
      {top3
        .sort((a, b) => a.rank - b.rank)
        .map((user, i) => {
          const heights = [60, 80, 50];
          const { rankColor, ring, bg } = styles[i];

          return (
            <div key={i} className="flex flex-col items-center relative text-center animate-float">
              {/* Glowing Avatar */}
              <div
                className={`w-24 h-24 rounded-full border-4 ${ring} bg-gradient-to-br ${rankColor} p-1 shadow-xl hover:scale-105 transition`}
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>

              {/* Rank Label */}
              <div className="mt-2 text-sm uppercase font-bold tracking-wider text-white/80 neon-text">
                {`Number #${user.rank}`}
              </div>

              {/* Podium Base */}
              <div
                className={`mt-4 w-28 rounded-xl ${bg} backdrop-blur-md border border-white/10`}
                style={{ height: `${heights[i]}px` }}
              >
                <div className="flex flex-col justify-center items-center h-full text-white">
                  <div className="text-xs text-white/60">Points</div>
                  <div className="text-lg font-semibold">{user.points}</div>
                </div>
              </div>
            </div>
          );
        })}
    </div>
  );
};

const LeaderboardList = () => (
  <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-xl p-6 w-full max-w-sm shadow-2xl mt-8">
    <h2 className="text-white text-xl font-semibold mb-4 neon-text">Leaderboard</h2>
    <ul className="space-y-3">
      {leaderboardData.map((user, i) => (
        <li
          key={i}
          className="bg-white/10 backdrop-blur-md text-white rounded-lg flex justify-between items-center p-3 shadow border border-white/10"
        >
          <div className="flex items-center gap-3">
            <img
              src={user.avatar}
              alt={user.name}
              className="w-10 h-10 object-cover rounded-full ring-2 ring-white/20"
            />
            <div>
              <div className="font-semibold">{user.name}</div>
              <div className="text-xs text-white/60">{user.points} points</div>
            </div>
          </div>
          {user.rank && (
            <div className="text-sm font-bold text-white/70">
              #{user.rank}
            </div>
          )}
        </li>
      ))}
    </ul>
  </div>
);

export default function LeaderboardPage() {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const timeout = setTimeout(() => setShowConfetti(false), 50000);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen  text-white p-10 flex items-center justify-center relative overflow-hidden">
      {showConfetti && <Confetti recycle={false} numberOfPieces={1000} />}
      <div className="flex flex-col lg:flex-row gap-16 items-center justify-center w-full max-w-7xl z-10">
        <div className="flex flex-col items-center">
          <h1 className="text-4xl font-bold mb-6 neon-text">🏆 Weekly Champions</h1>
          <Podium />
        </div>
        <LeaderboardList />
      </div>
    </div>
  );
}
