import React from 'react';

const ProfileStats = ({ stats }) => {
  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
      <h2 className="text-xl font-bold text-white mb-4">Profile Statistics</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-white/60 text-xs mb-1">Quizzes Created</p>
          <p className="text-white font-semibold">{stats.quizzesCreated || 0}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-white/60 text-xs mb-1">Quizzes Taken</p>
          <p className="text-white font-semibold">{stats.quizzesTaken || 0}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-white/60 text-xs mb-1">Average Score</p>
          <p className="text-white font-semibold">{stats.averageScore || 'N/A'}</p>
        </div>
        <div className="bg-white/5 rounded-lg p-3">
          <p className="text-white/60 text-xs mb-1">Knowledge Areas</p>
          <p className="text-white font-semibold">{stats.knowledgeAreas || 0}</p>
        </div>
      </div>
    </div>
  );
};

export default ProfileStats;