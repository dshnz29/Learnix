'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  FaArrowLeft,
  FaBell,
  FaLock,
  FaShieldAlt,
  FaPalette,
  FaGlobe,
  FaTrashAlt,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaSave,
  FaExclamationTriangle
} from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';
import { SettingsService } from '../../../services/settingsService';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('notifications');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      quizReminders: true,
      achievements: true,
      marketing: false
    },
    privacy: {
      profileVisibility: 'public',
      showStats: true,
      showActivity: false,
      allowMessages: true
    },
    theme: 'dark',
    language: 'en'
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [newEmail, setNewEmail] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const { user, userProfile, logout } = useAuth();
  const router = useRouter();

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Load existing settings
    if (userProfile?.preferences) {
      setSettings(prev => ({
        ...prev,
        notifications: userProfile.preferences.notifications || prev.notifications,
        privacy: userProfile.preferences.privacy || prev.privacy,
        theme: userProfile.preferences.theme || prev.theme,
        language: userProfile.preferences.language || prev.language
      }));
    }

    setNewEmail(user.email || '');
  }, [user, userProfile, router]);

  const handleSettingChange = (category, setting, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
  };

  const handleSaveNotifications = async () => {
    setLoading(true);
    try {
      await SettingsService.updateNotificationSettings(user.uid, settings.notifications);
      setMessage({ type: 'success', content: 'Notification settings updated!' });
    } catch (error) {
      setMessage({ type: 'error', content: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrivacy = async () => {
    setLoading(true);
    try {
      await SettingsService.updatePrivacySettings(user.uid, settings.privacy);
      setMessage({ type: 'success', content: 'Privacy settings updated!' });
    } catch (error) {
      setMessage({ type: 'error', content: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTheme = async () => {
    setLoading(true);
    try {
      await SettingsService.updateTheme(user.uid, settings.theme);
      setMessage({ type: 'success', content: 'Theme updated!' });
    } catch (error) {
      setMessage({ type: 'error', content: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveLanguage = async () => {
    setLoading(true);
    try {
      await SettingsService.updateLanguage(user.uid, settings.language);
      setMessage({ type: 'success', content: 'Language updated!' });
    } catch (error) {
      setMessage({ type: 'error', content: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      setMessage({ type: 'error', content: 'New passwords do not match!' });
      return;
    }

    if (passwords.new.length < 6) {
      setMessage({ type: 'error', content: 'Password must be at least 6 characters!' });
      return;
    }

    setLoading(true);
    try {
      // Note: You might need to re-authenticate the user before changing password
      await SettingsService.changePassword(passwords.new);
      setMessage({ type: 'success', content: 'Password changed successfully!' });
      setPasswords({ current: '', new: '', confirm: '' });
      setShowPasswordFields(false);
    } catch (error) {
      setMessage({ type: 'error', content: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleEmailChange = async () => {
    if (!newEmail || newEmail === user.email) return;

    setLoading(true);
    try {
      await SettingsService.updateEmail(newEmail);
      setMessage({ type: 'success', content: 'Email update request sent! Please check your inbox.' });
    } catch (error) {
      setMessage({ type: 'error', content: error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await SettingsService.deleteAccount(user.uid);
      await logout();
      router.push('/');
    } catch (error) {
      setMessage({ type: 'error', content: error.message });
      setShowDeleteConfirm(false);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: FaBell },
    { id: 'security', label: 'Security', icon: FaLock },
    { id: 'privacy', label: 'Privacy', icon: FaShieldAlt },
    { id: 'appearance', label: 'Appearance', icon: FaPalette },
    { id: 'account', label: 'Account', icon: FaTrashAlt }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-4 mb-8"
        >
          <button
            onClick={() => router.push('/dashboard')}
            className="text-white/70 hover:text-white transition-colors"
          >
            <FaArrowLeft size={14} />
          </button>
          <h1 className="text-xl font-bold text-white">Settings</h1>
        </motion.div>

        {/* Message Display */}
        {message.content && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success'
                ? 'bg-green-500/10 border-green-400/30 text-green-400'
                : 'bg-red-500/10 border-red-400/30 text-red-400'
            }`}
          >
            {message.content}
          </motion.div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === tab.id
                          ? 'bg-[#18DEA3]/20 text-[#18DEA3] border border-[#18DEA3]/30'
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </motion.div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-3"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
              {/* Notifications Tab */}
              {activeTab === 'notifications' && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Notification Preferences</h2>
                  <div className="space-y-6">
                    {[
                      { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
                      { key: 'push', label: 'Push Notifications', desc: 'Receive browser push notifications' },
                      { key: 'quizReminders', label: 'Quiz Reminders', desc: 'Get reminded about upcoming quizzes' },
                      { key: 'achievements', label: 'Achievement Alerts', desc: 'Get notified when you earn achievements' },
                      { key: 'marketing', label: 'Marketing Emails', desc: 'Receive promotional emails and updates' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                        <div>
                          <h4 className="text-white font-medium">{item.label}</h4>
                          <p className="text-white/60 text-sm">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.notifications[item.key]}
                            onChange={(e) => handleSettingChange('notifications', item.key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#18DEA3]"></div>
                        </label>
                      </div>
                    ))}
                    <button
                      onClick={handleSaveNotifications}
                      disabled={loading}
                      className="flex items-center space-x-2 bg-gradient-to-r from-[#18DEA3] to-[#382693] text-white px-6 py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
                    >
                      <FaSave size={16} />
                      <span>{loading ? 'Saving...' : 'Save Notifications'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {activeTab === 'security' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Security Settings</h2>
                  <div className="space-y-6">
                    {/* Change Email */}
                    <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                      <h3 className="text-white font-medium mb-4">Change Email Address</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-white/80 text-sm font-medium mb-2">
                            Current Email
                          </label>
                          <div className="p-3 bg-white/5 rounded-lg text-white/60 border border-white/20">
                            {user.email}
                          </div>
                        </div>
                        <div>
                          <label className="block text-white/80 text-sm font-medium mb-2">
                            New Email
                          </label>
                          <input
                            type="email"
                            value={newEmail}
                            onChange={(e) => setNewEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#18DEA3]/20"
                            placeholder="Enter new email"
                          />
                        </div>
                        <button
                          onClick={handleEmailChange}
                          disabled={loading || newEmail === user.email}
                          className="flex items-center space-x-2 bg-[#18DEA3] text-white px-4 py-2 rounded-lg hover:bg-[#18DEA3]/80 transition disabled:opacity-50"
                        >
                          <FaEnvelope size={16} />
                          <span>Update Email</span>
                        </button>
                      </div>
                    </div>

                    {/* Change Password */}
                    <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                      <h3 className="text-white font-medium mb-4">Change Password</h3>
                      {!showPasswordFields ? (
                        <button
                          onClick={() => setShowPasswordFields(true)}
                          className="flex items-center space-x-2 bg-[#18DEA3] text-white px-4 py-2 rounded-lg hover:bg-[#18DEA3]/80 transition"
                        >
                          <FaLock size={16} />
                          <span>Change Password</span>
                        </button>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-white/80 text-sm font-medium mb-2">
                              Current Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswords.current ? 'text' : 'password'}
                                value={passwords.current}
                                onChange={(e) => setPasswords(prev => ({ ...prev, current: e.target.value }))}
                                className="w-full px-4 pr-12 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#18DEA3]/20"
                                placeholder="Enter current password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                              >
                                {showPasswords.current ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-white/80 text-sm font-medium mb-2">
                              New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswords.new ? 'text' : 'password'}
                                value={passwords.new}
                                onChange={(e) => setPasswords(prev => ({ ...prev, new: e.target.value }))}
                                className="w-full px-4 pr-12 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#18DEA3]/20"
                                placeholder="Enter new password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                              >
                                {showPasswords.new ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-white/80 text-sm font-medium mb-2">
                              Confirm New Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPasswords.confirm ? 'text' : 'password'}
                                value={passwords.confirm}
                                onChange={(e) => setPasswords(prev => ({ ...prev, confirm: e.target.value }))}
                                className="w-full px-4 pr-12 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#18DEA3]/20"
                                placeholder="Confirm new password"
                              />
                              <button
                                type="button"
                                onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                              >
                                {showPasswords.confirm ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                              </button>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <button
                              onClick={handlePasswordChange}
                              disabled={loading}
                              className="flex items-center space-x-2 bg-gradient-to-r from-[#18DEA3] to-[#382693] text-white px-4 py-2 rounded-lg hover:shadow-lg transition disabled:opacity-50"
                            >
                              <FaSave size={16} />
                              <span>{loading ? 'Changing...' : 'Change Password'}</span>
                            </button>
                            <button
                              onClick={() => {
                                setShowPasswordFields(false);
                                setPasswords({ current: '', new: '', confirm: '' });
                              }}
                              className="px-4 py-2 bg-white/10 text-white rounded-lg border border-white/20 hover:bg-white/20 transition"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Privacy Tab */}
              {activeTab === 'privacy' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Privacy Settings</h2>
                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                      <h3 className="text-white font-medium mb-4">Profile Visibility</h3>
                      <div className="space-y-3">
                        {[
                          { value: 'public', label: 'Public', desc: 'Anyone can view your profile' },
                          { value: 'friends', label: 'Friends Only', desc: 'Only your friends can view your profile' },
                          { value: 'private', label: 'Private', desc: 'Only you can view your profile' }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                            <input
                              type="radio"
                              name="profileVisibility"
                              value={option.value}
                              checked={settings.privacy.profileVisibility === option.value}
                              onChange={(e) => handleSettingChange('privacy', 'profileVisibility', e.target.value)}
                              className="w-4 h-4 text-[#18DEA3] border-white/30 focus:ring-[#18DEA3] focus:ring-2"
                            />
                            <div>
                              <p className="text-white font-medium">{option.label}</p>
                              <p className="text-white/60 text-sm">{option.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        { key: 'showStats', label: 'Show Statistics', desc: 'Display your quiz stats publicly' },
                        { key: 'showActivity', label: 'Show Activity', desc: 'Display your recent activity' },
                        { key: 'allowMessages', label: 'Allow Messages', desc: 'Allow other users to message you' }
                      ].map((item) => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/10">
                          <div>
                            <h3 className="text-white font-medium">{item.label}</h3>
                            <p className="text-white/60 text-sm">{item.desc}</p>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={settings.privacy[item.key]}
                              onChange={(e) => handleSettingChange('privacy', item.key, e.target.checked)}
                              className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#18DEA3]"></div>
                          </label>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleSavePrivacy}
                      disabled={loading}
                      className="flex items-center space-x-2 bg-gradient-to-r from-[#18DEA3] to-[#382693] text-white px-6 py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
                    >
                      <FaSave size={16} />
                      <span>{loading ? 'Saving...' : 'Save Privacy Settings'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {activeTab === 'appearance' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Appearance Settings</h2>
                  <div className="space-y-6">
                    <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                      <h3 className="text-white font-medium mb-4">Theme</h3>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {[
                          { value: 'dark', label: 'Dark', desc: 'Dark theme (current)' },
                          { value: 'light', label: 'Light', desc: 'Light theme' },
                          { value: 'auto', label: 'Auto', desc: 'Follow system theme' }
                        ].map((theme) => (
                          <label
                            key={theme.value}
                            className={`cursor-pointer p-4 rounded-lg border transition-all ${
                              settings.theme === theme.value
                                ? 'border-[#18DEA3] bg-[#18DEA3]/10'
                                : 'border-white/20 bg-white/5 hover:border-white/30'
                            }`}
                          >
                            <input
                              type="radio"
                              name="theme"
                              value={theme.value}
                              checked={settings.theme === theme.value}
                              onChange={(e) => handleSettingChange('theme', null, e.target.value)}
                              className="sr-only"
                            />
                            <div className="text-center">
                              <FaPalette className={`mx-auto mb-2 ${settings.theme === theme.value ? 'text-[#18DEA3]' : 'text-white/60'}`} size={24} />
                              <p className="text-white font-medium">{theme.label}</p>
                              <p className="text-white/60 text-sm">{theme.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="p-6 bg-white/5 rounded-lg border border-white/10">
                      <h3 className="text-white font-medium mb-4">Language</h3>
                      <select
                        value={settings.language}
                        onChange={(e) => handleSettingChange('language', null, e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#18DEA3]/20"
                      >
                        <option value="en" className="bg-slate-800 text-white">English</option>
                        <option value="es" className="bg-slate-800 text-white">Español</option>
                        <option value="fr" className="bg-slate-800 text-white">Français</option>
                        <option value="de" className="bg-slate-800 text-white">Deutsch</option>
                      </select>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={handleSaveTheme}
                        disabled={loading}
                        className="flex items-center space-x-2 bg-gradient-to-r from-[#18DEA3] to-[#382693] text-white px-6 py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
                      >
                        <FaSave size={16} />
                        <span>{loading ? 'Saving...' : 'Save Theme'}</span>
                      </button>
                      <button
                        onClick={handleSaveLanguage}
                        disabled={loading}
                        className="flex items-center space-x-2 bg-gradient-to-r from-[#18DEA3] to-[#382693] text-white px-6 py-3 rounded-lg hover:shadow-lg transition disabled:opacity-50"
                      >
                        <FaGlobe size={16} />
                        <span>{loading ? 'Saving...' : 'Save Language'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Tab */}
              {activeTab === 'account' && (
                <div>
                  <h2 className="text-2xl font-bold text-white mb-6">Account Management</h2>
                  <div className="space-y-6">
                    <div className="p-6 bg-red-500/10 rounded-lg border border-red-400/30">
                      <div className="flex items-start space-x-4">
                        <FaExclamationTriangle className="text-red-400 text-2xl mt-1" />
                        <div className="flex-1">
                          <h3 className="text-red-400 font-semibold text-lg mb-2">Danger Zone</h3>
                          <p className="text-white/80 mb-4">
                            Once you delete your account, there is no going back. Please be certain.
                          </p>
                          <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="flex items-center space-x-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                          >
                            <FaTrashAlt size={16} />
                            <span>Delete Account</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-white/10 to-white/5 border border-red-400/30 backdrop-blur-xl p-6 rounded-2xl w-full max-w-md shadow-2xl text-white">
            <div className="text-center">
              <FaExclamationTriangle size={48} className="text-red-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Delete Account</h3>
              <p className="text-white/70 mb-6">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-white/10 border border-white/20 py-2 px-4 rounded-lg font-semibold hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="flex-1 bg-red-500 py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition disabled:opacity-50"
                >
                  {loading ? 'Deleting...' : 'Delete Forever'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}