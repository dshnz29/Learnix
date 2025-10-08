'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import AccountSettings from '../../../components/settings/AccountSettings';
import NotificationSettings from '../../../components/settings/NotificationSettings';
import PrivacySettings from '../../../components/settings/PrivacySettings';
import ThemeSettings from '../../../components/settings/ThemeSettings';
import { updateUserSettings } from '../../../services/settingsService';

const SettingsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  
  const [settings, setSettings] = useState({
    notifications: true,
    privacy: 'public',
    theme: 'light',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      // Fetch current settings from the server or local storage
      fetchUserSettings();
    }
  }, [user]);

  const fetchUserSettings = async () => {
    // Fetch user settings logic here
    // Example: setSettings(fetchedSettings);
  };

  const handleSettingsChange = (newSettings) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateUserSettings(settings);
      router.push('/dashboard/profile'); // Redirect after saving
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      <h1 className="text-2xl font-bold">Settings</h1>
      {error && <p className="text-red-500">{error}</p>}
      <AccountSettings settings={settings} onChange={handleSettingsChange} />
      <NotificationSettings settings={settings} onChange={handleSettingsChange} />
      <PrivacySettings settings={settings} onChange={handleSettingsChange} />
      <ThemeSettings settings={settings} onChange={handleSettingsChange} />
      <button 
        onClick={handleSaveSettings} 
        disabled={loading} 
        className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        {loading ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
};

export default SettingsPage;