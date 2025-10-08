// This file contains the main dashboard page that serves as a container for the profile and settings components.

import React from 'react';
import { useRouter } from 'next/navigation';

const DashboardPage = () => {
  const router = useRouter();

  const handleProfileClick = () => {
    router.push('/dashboard/profile');
  };

  const handleSettingsClick = () => {
    router.push('/dashboard/settings');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#382693] to-slate-900 p-8">
      <h1 className="text-3xl font-bold text-white mb-6">Dashboard</h1>
      <div className="space-y-4">
        <button
          onClick={handleProfileClick}
          className="w-full px-4 py-2 bg-[#18DEA3] text-white rounded-lg hover:bg-[#18DEA3]/80 transition"
        >
          Go to Profile
        </button>
        <button
          onClick={handleSettingsClick}
          className="w-full px-4 py-2 bg-[#18DEA3] text-white rounded-lg hover:bg-[#18DEA3]/80 transition"
        >
          Go to Settings
        </button>
      </div>
    </div>
  );
};

export default DashboardPage;