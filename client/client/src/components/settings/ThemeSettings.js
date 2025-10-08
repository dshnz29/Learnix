import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { updateTheme } from '../../../services/settingsService';

const ThemeSettings = () => {
  const { user } = useAuth();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Fetch the current theme from user settings
    const fetchTheme = async () => {
      // Assuming there's a function to get user settings
      const userSettings = await getUserSettings(user.uid);
      setTheme(userSettings.theme || 'light');
    };

    fetchTheme();
  }, [user]);

  const handleThemeChange = async (event) => {
    const selectedTheme = event.target.value;
    setTheme(selectedTheme);
    await updateTheme(user.uid, selectedTheme);
  };

  return (
    <div className="theme-settings">
      <h2 className="text-lg font-semibold">Theme Settings</h2>
      <div className="flex items-center">
        <label htmlFor="theme-select" className="mr-2">Select Theme:</label>
        <select id="theme-select" value={theme} onChange={handleThemeChange} className="border rounded p-2">
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
    </div>
  );
};

export default ThemeSettings;