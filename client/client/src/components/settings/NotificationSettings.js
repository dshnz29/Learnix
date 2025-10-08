import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updateNotificationSettings } from '../../services/settingsService';

const NotificationSettings = () => {
  const { user } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch current notification settings from the server or local storage
    const fetchNotificationSettings = async () => {
      try {
        // Replace with actual API call to fetch settings
        const settings = await fetch(`/api/settings/notifications/${user.id}`);
        const data = await settings.json();
        setEmailNotifications(data.emailNotifications);
        setSmsNotifications(data.smsNotifications);
      } catch (err) {
        console.error('Failed to fetch notification settings:', err);
      }
    };

    if (user) {
      fetchNotificationSettings();
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    try {
      await updateNotificationSettings(user.id, {
        emailNotifications,
        smsNotifications,
      });
      alert('Notification settings updated successfully!');
    } catch (err) {
      setError('Failed to update notification settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="notification-settings">
      <h2 className="text-lg font-bold">Notification Settings</h2>
      {error && <p className="text-red-500">{error}</p>}
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={emailNotifications}
          onChange={() => setEmailNotifications(!emailNotifications)}
        />
        <label className="ml-2">Email Notifications</label>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          checked={smsNotifications}
          onChange={() => setSmsNotifications(!smsNotifications)}
        />
        <label className="ml-2">SMS Notifications</label>
      </div>
      <button
        onClick={handleSave}
        disabled={loading}
        className={`mt-4 px-4 py-2 rounded ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
      >
        {loading ? 'Saving...' : 'Save Settings'}
      </button>
    </div>
  );
};

export default NotificationSettings;