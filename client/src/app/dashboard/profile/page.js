'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  FaArrowLeft, 
  FaEdit, 
  FaSave, 
  FaTimes, 
  FaUser, 
  FaEnvelope, 
  FaBuilding, 
  FaGraduationCap,
  FaCamera,
  FaTrash,
  FaEye,
  FaEyeSlash
} from 'react-icons/fa';
import { useAuth } from '../../../contexts/AuthContext';
import Image from 'next/image';

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', content: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    institution: '',
    bio: '',
    avatar: 0,
    role: 'student'
  });

  const { user, userProfile, updateUserProfile, logout } = useAuth();
  const router = useRouter();

  // Initialize form data
  useEffect(() => {
    if (userProfile) {
      setFormData({
        firstName: userProfile.firstName || '',
        lastName: userProfile.lastName || '',
        username: userProfile.username || '',
        email: user?.email || '',
        institution: userProfile.institution || '',
        bio: userProfile.bio || '',
        avatar: userProfile.avatar || 0,
        role: userProfile.role || 'student'
      });
    }
  }, [userProfile, user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (avatarIndex) => {
    setFormData(prev => ({
      ...prev,
      avatar: avatarIndex
    }));
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage({ type: '', content: '' });

    try {
      await updateUserProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        username: formData.username,
        institution: formData.institution,
        bio: formData.bio,
        avatar: formData.avatar,
        displayName: `${formData.firstName} ${formData.lastName}`
      });

      setMessage({ type: 'success', content: 'Profile updated successfully!' });
      setIsEditing(false);
    } catch (error) {
      setMessage({ type: 'error', content: error.message || 'Failed to update profile' });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', content: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', content: 'Password must be at least 6 characters' });
      return;
    }

    setLoading(true);
    try {
      // This would require additional Firebase auth methods
      setMessage({ type: 'success', content: 'Password updated successfully!' });
      setShowPasswordChange(false);
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ type: 'error', content: 'Failed to update password' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      // This would require additional Firebase auth methods for account deletion
      await logout();
      router.push('/');
    } catch (error) {
      setMessage({ type: 'error', content: 'Failed to delete account' });
    } finally {
      setLoading(false);
    }
  };

  const getAvatarUrl = (index) => {
    return `/avatars/avatar${index + 1}.png`;
  };

  const avatars = Array.from({ length: 6 }, (_, i) => i);

  return (
    <div className="min-h-screen p-6">
      <div className="min-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 text-white/70 hover:text-white transition-colors rounded-lg hover:bg-white/10"
            >
              <FaArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          </div>

          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="flex items-center space-x-2 bg-[#18DEA3] text-white px-4 py-2 rounded-lg hover:bg-[#18DEA3]/80 transition"
            >
              <FaEdit size={16} />
              <span>Edit Profile</span>
            </button>
          )}
        </motion.div>

        {/* Message Display */}
        <AnimatePresence>
          {message.content && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`mb-6 p-4 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-green-500/10 border-green-400/30 text-green-400'
                  : 'bg-red-500/10 border-red-400/30 text-red-400'
              }`}
            >
              {message.content}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="text-center">
                <div className="relative inline-block mb-4">
                  <Image
                    src={getAvatarUrl(formData.avatar)}
                    alt="Profile"
                    width={120}
                    height={120}
                    className="rounded-full mx-auto border-4 border-[#18DEA3]/30"
                  />
                  {isEditing && (
                    <button
                      onClick={() => document.getElementById('avatar-selector').scrollIntoView()}
                      className="absolute bottom-0 right-0 bg-[#18DEA3] rounded-full p-2 text-white hover:bg-[#18DEA3]/80 transition"
                    >
                      <FaCamera size={16} />
                    </button>
                  )}
                </div>

                <h2 className="text-2xl font-bold text-white mb-2">
                  {formData.firstName} {formData.lastName}
                </h2>
                <p className="text-[#18DEA3] capitalize mb-4">{formData.role}</p>
                
                {userProfile?.stats && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-r from-[#18DEA3]/20 to-[#382693]/20 p-3 rounded-lg text-center">
                      <p className="text-xl font-bold text-[#18DEA3]">{userProfile.stats.quizzesCreated || 0}</p>
                      <p className="text-xs text-white/60">Created</p>
                    </div>
                    <div className="bg-gradient-to-r from-[#382693]/20 to-[#18DEA3]/20 p-3 rounded-lg text-center">
                      <p className="text-xl font-bold text-[#18DEA3]">{userProfile.stats.quizzesTaken || 0}</p>
                      <p className="text-xs text-white/60">Taken</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Profile Form */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-xl font-semibold text-white mb-4">Basic Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">First Name</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#18DEA3]/20 disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Last Name</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#18DEA3]/20 disabled:opacity-50"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Username</label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#18DEA3]/20 disabled:opacity-50"
                      />
                    </div>

                    <div>
                      <label className="block text-white/80 text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        disabled
                        className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white/50 opacity-50 cursor-not-allowed"
                      />
                      <p className="text-xs text-white/50 mt-1">Email cannot be changed</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <label className="block text-white/80 text-sm font-medium mb-2">Institution</label>
                    <input
                      type="text"
                      name="institution"
                      value={formData.institution}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      placeholder="Your school or university"
                      className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#18DEA3]/20 disabled:opacity-50"
                    />
                  </div>

                  <div className="mt-4">
                    <label className="block text-white/80 text-sm font-medium mb-2">Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      rows={3}
                      placeholder="Tell us about yourself..."
                      className="w-full p-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#18DEA3]/20 disabled:opacity-50 resize-none"
                    />
                  </div>
                </div>

                {/* Avatar Selection */}
                {isEditing && (
                  <div id="avatar-selector">
                    <h3 className="text-xl font-semibold text-white mb-4">Choose Avatar</h3>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                      {avatars.map((index) => (
                        <button
                          key={index}
                          onClick={() => handleAvatarChange(index)}
                          className={`relative p-2 rounded-lg transition-all ${
                            formData.avatar === index
                              ? 'ring-4 ring-[#18DEA3]/50 bg-[#18DEA3]/20'
                              : 'hover:bg-white/10'
                          }`}
                        >
                          <Image
                            src={getAvatarUrl(index)}
                            alt={`Avatar ${index + 1}`}
                            width={60}
                            height={60}
                            className="rounded-full mx-auto"
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                {isEditing && (
                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-white/20">
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="flex items-center justify-center space-x-2 bg-[#18DEA3] text-white px-6 py-3 rounded-lg hover:bg-[#18DEA3]/80 transition disabled:opacity-50"
                    >
                      <FaSave size={16} />
                      <span>{loading ? 'Saving...' : 'Save Changes'}</span>
                    </button>

                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center justify-center space-x-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition"
                    >
                      <FaTimes size={16} />
                      <span>Cancel</span>
                    </button>

                    <button
                      onClick={() => setShowPasswordChange(true)}
                      className="flex items-center justify-center space-x-2 bg-yellow-500/20 border border-yellow-400/30 text-yellow-300 px-6 py-3 rounded-lg hover:bg-yellow-500/30 transition"
                    >
                      <FaEdit size={16} />
                      <span>Change Password</span>
                    </button>

                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="flex items-center justify-center space-x-2 bg-red-500/20 border border-red-400/30 text-red-300 px-6 py-3 rounded-lg hover:bg-red-500/30 transition"
                    >
                      <FaTrash size={16} />
                      <span>Delete Account</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Password Change Modal */}
      <AnimatePresence>
        {showPasswordChange && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-md border border-white/20 text-white"
            >
              <h3 className="text-xl font-bold mb-4">Change Password</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-3 pr-10 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#18DEA3]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                    >
                      {showPasswords.current ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-3 pr-10 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#18DEA3]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                    >
                      {showPasswords.new ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full p-3 pr-10 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-[#18DEA3]/20"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60"
                    >
                      {showPasswords.confirm ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowPasswordChange(false)}
                  className="flex-1 bg-white/10 border border-white/20 py-2 px-4 rounded-lg hover:bg-white/20 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordUpdate}
                  disabled={loading}
                  className="flex-1 bg-[#18DEA3] py-2 px-4 rounded-lg hover:bg-[#18DEA3]/80 transition disabled:opacity-50"
                >
                  {loading ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Account Confirmation */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white/10 backdrop-blur-md rounded-2xl p-6 w-full max-w-md border border-white/20 text-white"
            >
              <div className="text-center">
                <FaTrash size={48} className="text-red-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Delete Account</h3>
                <p className="text-white/70 mb-6">
                  This action cannot be undone. All your data will be permanently deleted.
                </p>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-white/10 border border-white/20 py-2 px-4 rounded-lg hover:bg-white/20 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={loading}
                    className="flex-1 bg-red-500 py-2 px-4 rounded-lg hover:bg-red-600 transition disabled:opacity-50"
                  >
                    {loading ? 'Deleting...' : 'Delete Account'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}