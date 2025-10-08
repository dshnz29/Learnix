import { db } from '../lib/firebase';
import { 
  doc, 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy, 
  serverTimestamp 
} from 'firebase/firestore';

export class LobbyService {
  // Update player score in Firebase
  static async updatePlayerScore(lobbyId, playerId, scoreData) {
    try {
      const playerRef = doc(db, 'lobbies', lobbyId, 'participants', playerId);
      await updateDoc(playerRef, {
        ...scoreData,
        lastUpdated: serverTimestamp()
      });
      console.log(`✅ Updated player ${playerId} score in Firebase`);
    } catch (error) {
      console.error('❌ Failed to update player score:', error);
      throw error;
    }
  }

  // Get real-time leaderboard
  static subscribeToLeaderboard(lobbyId, callback) {
    const leaderboardQuery = query(
      collection(db, 'lobbies', lobbyId, 'participants'),
      orderBy('score', 'desc')
    );

    return onSnapshot(leaderboardQuery, (snapshot) => {
      const leaderboard = [];
      snapshot.forEach((doc) => {
        leaderboard.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(leaderboard);
    });
  }

  // Get real-time participants
  static subscribeToParticipants(lobbyId, callback) {
    const participantsQuery = query(
      collection(db, 'lobbies', lobbyId, 'participants'),
      orderBy('joinedAt', 'asc')
    );

    return onSnapshot(participantsQuery, (snapshot) => {
      const participants = [];
      snapshot.forEach((doc) => {
        participants.push({
          id: doc.id,
          ...doc.data()
        });
      });
      callback(participants);
    });
  }

  // Update player status (ready, disconnected, etc.)
  static async updatePlayerStatus(lobbyId, playerId, status) {
    try {
      const playerRef = doc(db, 'lobbies', lobbyId, 'participants', playerId);
      await updateDoc(playerRef, {
        status,
        lastUpdated: serverTimestamp()
      });
    } catch (error) {
      console.error('❌ Failed to update player status:', error);
      throw error;
    }
  }
}

export default LobbyService;