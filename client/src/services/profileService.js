import { doc, updateDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { updateProfile, updatePassword } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, auth, storage } from '../lib/firebase';

export class ProfileService {
  // Update user profile in Firestore
  static async updateUserProfile(userId, updates) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: serverTimestamp()
      });
      
      // Update Firebase Auth profile if display name changed
      if (updates.displayName && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: updates.displayName
        });
      }
      
      return { success: true, message: 'Profile updated successfully!' };
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  }

  // Upload avatar image
  static async uploadAvatar(userId, file) {
    try {
      const storageRef = ref(storage, `avatars/${userId}/${Date.now()}_${file.name}`);
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update user profile with new photo URL
      await this.updateUserProfile(userId, { photoURL: downloadURL });
      
      return { success: true, photoURL: downloadURL };
    } catch (error) {
      console.error('Avatar upload error:', error);
      throw error;
    }
  }

  // Change password
  static async changePassword(newPassword) {
    try {
      if (!auth.currentUser) {
        throw new Error('No authenticated user');
      }
      
      await updatePassword(auth.currentUser, newPassword);
      return { success: true, message: 'Password updated successfully!' };
    } catch (error) {
      console.error('Password change error:', error);
      throw error;
    }
  }

  // Get user profile
  static async getUserProfile(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }

  // Update user stats
  static async updateUserStats(userId, stats) {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        stats: {
          ...stats,
          lastActive: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });
      
      return { success: true };
    } catch (error) {
      console.error('Stats update error:', error);
      throw error;
    }
  }
}