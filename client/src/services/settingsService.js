import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { updateEmail, sendEmailVerification, deleteUser } from 'firebase/auth';
import { db, auth } from '../lib/firebase';

export class SettingsService {
  // Update notification preferences
  static async updateNotificationSettings(userId, notifications) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'preferences.notifications': notifications,
        updatedAt: serverTimestamp()
      });
      
      return { success: true, message: 'Notification settings updated!' };
    } catch (error) {
      console.error('Notification settings error:', error);
      throw error;
    }
  }

  // Update privacy settings
  static async updatePrivacySettings(userId, privacy) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'preferences.privacy': privacy,
        updatedAt: serverTimestamp()
      });
      
      return { success: true, message: 'Privacy settings updated!' };
    } catch (error) {
      console.error('Privacy settings error:', error);
      throw error;
    }
  }

  // Update theme preference
  static async updateTheme(userId, theme) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'preferences.theme': theme,
        updatedAt: serverTimestamp()
      });
      
      return { success: true, message: 'Theme updated!' };
    } catch (error) {
      console.error('Theme update error:', error);
      throw error;
    }
  }

  // Update language preference
  static async updateLanguage(userId, language) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        'preferences.language': language,
        updatedAt: serverTimestamp()
      });
      
      return { success: true, message: 'Language updated!' };
    } catch (error) {
      console.error('Language update error:', error);
      throw error;
    }
  }

  // Update email
  static async updateEmail(newEmail) {
    try {
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }
      
      await updateEmail(auth.currentUser, newEmail);
      await sendEmailVerification(auth.currentUser);
      
      return { success: true, message: 'Email updated! Please verify your new email.' };
    } catch (error) {
      console.error('Email update error:', error);
      throw error;
    }
  }

  // Delete account
  static async deleteAccount(userId) {
    try {
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }

      // Delete user document
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        isActive: false,
        deletedAt: serverTimestamp()
      });

      // Delete Firebase Auth user
      await deleteUser(auth.currentUser);
      
      return { success: true, message: 'Account deleted successfully!' };
    } catch (error) {
      console.error('Account deletion error:', error);
      throw error;
    }
  }
}