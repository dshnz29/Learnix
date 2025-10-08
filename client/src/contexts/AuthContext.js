'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  // Sign up with email and password
  const signup = async (email, password, userData) => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update display name
      await updateProfile(user, {
        displayName: userData.displayName || userData.firstName + ' ' + userData.lastName
      });

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        displayName: userData.displayName || userData.firstName + ' ' + userData.lastName,
        firstName: userData.firstName,
        lastName: userData.lastName,
        username: userData.username,
        avatar: userData.avatar || 0,
        role: userData.role || 'student',
        institution: userData.institution || '',
        bio: userData.bio || '',
        preferences: {
          theme: 'dark',
          notifications: true,
          language: 'en'
        },
        stats: {
          quizzesCreated: 0,
          quizzesTaken: 0,
          totalScore: 0,
          averageScore: 0,
          streakDays: 0,
          lastActive: serverTimestamp()
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        emailVerified: false,
        isActive: true
      });

      // Send email verification
      await sendEmailVerification(user);

      return { user, success: true, message: 'Account created successfully! Please check your email to verify your account.' };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  // Sign in with email and password
  const login = async (email, password) => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);
      
      // Update last login time
      await updateDoc(doc(db, 'users', user.uid), {
        lastLoginAt: serverTimestamp(),
        'stats.lastActive': serverTimestamp()
      });

      return { user, success: true, message: 'Logged in successfully!' };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  // Sign in with Google
  const loginWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const { user } = await signInWithPopup(auth, provider);
      
      // Check if user profile exists
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        // Create new user profile for Google sign-in
        await setDoc(doc(db, 'users', user.uid), {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          username: user.email?.split('@')[0] || '',
          avatar: 0,
          photoURL: user.photoURL,
          role: 'student',
          institution: '',
          bio: '',
          preferences: {
            theme: 'dark',
            notifications: true,
            language: 'en'
          },
          stats: {
            quizzesCreated: 0,
            quizzesTaken: 0,
            totalScore: 0,
            averageScore: 0,
            streakDays: 0,
            lastActive: serverTimestamp()
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          emailVerified: user.emailVerified,
          isActive: true
        });
      } else {
        // Update existing user's last login
        await updateDoc(doc(db, 'users', user.uid), {
          lastLoginAt: serverTimestamp(),
          'stats.lastActive': serverTimestamp()
        });
      }

      return { user, success: true, message: 'Logged in with Google successfully!' };
    } catch (error) {
      console.error('Google login error:', error);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent! Check your inbox.' };
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  };

  // Sign out
  const logout = async () => {
    try {
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          lastLogoutAt: serverTimestamp()
        });
      }
      await signOut(auth);
      setUserProfile(null);
      return { success: true, message: 'Logged out successfully!' };
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  // Update user profile
  const updateUserProfile = async (updates) => {
    try {
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), {
          ...updates,
          updatedAt: serverTimestamp()
        });
        
        // Update auth profile if display name changed
        if (updates.displayName) {
          await updateProfile(user, {
            displayName: updates.displayName
          });
        }

        // Refresh user profile
        await fetchUserProfile(user.uid);
        
        return { success: true, message: 'Profile updated successfully!' };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // Fetch user profile from Firestore
  const fetchUserProfile = async (uid) => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserProfile(userData);
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Fetch user profile error:', error);
      return null;
    }
  };

  // Check username availability
  const checkUsernameAvailability = async (username) => {
    try {
      // You'll need to create a separate collection for usernames or use a cloud function
      // For now, we'll do a simple check (this is not the most efficient way)
      return { available: true }; // Simplified for now
    } catch (error) {
      console.error('Username check error:', error);
      return { available: false };
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        await fetchUserProfile(user.uid);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    user,
    userProfile,
    loading,
    signup,
    login,
    loginWithGoogle,
    logout,
    resetPassword,
    updateUserProfile,
    fetchUserProfile,
    checkUsernameAvailability
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};