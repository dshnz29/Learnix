import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

// Function to update user settings
export const updateUserSettings = async (userId, settings) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, settings);
    return { success: true };
  } catch (error) {
    console.error('Error updating user settings:', error);
    return { success: false, error: error.message };
  }
};

// Function to change user password
export const changeUserPassword = async (user, newPassword) => {
  try {
    await user.updatePassword(newPassword);
    return { success: true };
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, error: error.message };
  }
};

// Function to update notification preferences
export const updateNotificationPreferences = async (userId, preferences) => {
  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { notificationPreferences: preferences });
    return { success: true };
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    return { success: false, error: error.message };
  }
};