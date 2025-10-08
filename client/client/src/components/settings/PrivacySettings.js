import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { updatePrivacySettings } from '../../services/settingsService';

const PrivacySettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    profileVisibility: 'public',
    dataSharing: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch current privacy settings from the server or local storage
    const fetchPrivacySettings = async () => {
      // Replace with actual API call
      const currentSettings = await getPrivacySettings(user.id);
      setSettings(currentSettings);
    };

    fetchPrivacySettings();
  }, [user]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await updatePrivacySettings(user.id, settings);
      alert('Privacy settings updated successfully!');
    } catch (err) {
      setError('Failed to update privacy settings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="privacy-settings">
      <h2 className="text-lg font-bold">Privacy Settings</h2>
      {error && <p className="text-red-500">{error}</p>}
      <form onSubmit={handleSubmit}>
        <div className="setting-item">
          <label>
            Profile Visibility:
            <select
              name="profileVisibility"
              value={settings.profileVisibility}
              onChange={handleChange}
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </label>
        </div>
        <div className="setting-item">
          <label>
            Share Data with Third Parties:
            <input
              type="checkbox"
              name="dataSharing"
              checked={settings.dataSharing}
              onChange={handleChange}
            />
          </label>
        </div>
        <button type="submit" disabled={loading} className="btn">
          {loading ? 'Saving...' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default PrivacySettings;