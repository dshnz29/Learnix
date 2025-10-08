'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '../../../services/profileService';
import ProfileForm from '../../../components/profile/ProfileForm';
import ProfileStats from '../../../components/profile/ProfileStats';

const ProfilePage = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const data = await getUserProfile(user.uid);
        setProfileData(data);
      } catch (err) {
        setError('Failed to load profile data.');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const handleProfileUpdate = async (updatedData) => {
    try {
      await updateUserProfile(user.uid, updatedData);
      setProfileData(updatedData);
    } catch (err) {
      setError('Failed to update profile data.');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="profile-page">
      <h1 className="text-2xl font-bold">Profile</h1>
      <ProfileForm profileData={profileData} onUpdate={handleProfileUpdate} />
      <ProfileStats profileData={profileData} />
    </div>
  );
};

export default ProfilePage;