const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const uploadRoutes = require('./routes/upload');
const singlePlayerRoutes = require('./routes/singlePlayer');

// Import Firebase Admin SDK
const admin = require('firebase-admin');
const serviceAccount = require('./config/serviceAccountKey.json');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:8000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

app.use(cors({ 
  origin: ["http://localhost:3000", "http://localhost:8000"],
  credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api", uploadRoutes);
app.use('/api/singleplayer', singlePlayerRoutes);

// In-memory storage for lobbies (for quick access)
const lobbies = new Map();

// Helper function to sync lobby to Firebase
async function syncLobbyToFirebase(lobbyId, lobbyData) {
  try {
    await db.collection('lobbies').doc(lobbyId).set({
      ...lobbyData,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`📊 Synced lobby ${lobbyId} to Firebase`);
  } catch (error) {
    console.error('❌ Failed to sync lobby to Firebase:', error);
  }
}

// Helper function to update player in Firebase
async function updatePlayerInFirebase(lobbyId, playerId, playerData) {
  try {
    await db.collection('lobbies').doc(lobbyId).collection('participants').doc(playerId).set({
      ...playerData,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    }, { merge: true });
    console.log(`👤 Updated player ${playerId} in Firebase`);
  } catch (error) {
    console.error('❌ Failed to update player in Firebase:', error);
  }
}

// Helper function to remove player from Firebase
async function removePlayerFromFirebase(lobbyId, playerId) {
  try {
    await db.collection('lobbies').doc(lobbyId).collection('participants').doc(playerId).delete();
    console.log(`🗑️ Removed player ${playerId} from Firebase`);
  } catch (error) {
    console.error('❌ Failed to remove player from Firebase:', error);
  }
}

// Socket.IO Events
io.on("connection", (socket) => {
  console.log(`🔗 Client connected: ${socket.id}`);

  // Create Lobby Event
  socket.on('create-lobby', async (data) => {
    const { quizId, hostName, hostAvatar, quizData } = data;
    
    console.log(`🏠 Creating lobby for quiz: ${quizId}`);
    
    const hostPlayer = {
      id: `host_${Date.now()}`,
      socketId: socket.id,
      name: hostName || 'Quiz Host',
      avatar: hostAvatar || 0,
      isHost: true,
      isReady: true,
      score: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      joinedAt: new Date(),
      status: 'active'
    };
    
    // Create lobby
    const lobby = {
      id: quizId,
      quiz: quizData,
      participants: [hostPlayer],
      status: 'waiting', // waiting, starting, active, finished
      createdAt: new Date(),
      hostId: hostPlayer.id
    };
    
    lobbies.set(quizId, lobby);
    socket.join(quizId);
    
    // Sync to Firebase
    await syncLobbyToFirebase(quizId, {
      id: quizId,
      quiz: quizData,
      status: lobby.status,
      createdAt: lobby.createdAt,
      hostId: hostPlayer.id,
      participantCount: 1
    });
    
    // Add host to Firebase participants
    await updatePlayerInFirebase(quizId, hostPlayer.id, hostPlayer);
    
    socket.emit('lobby-created', {
      success: true,
      lobby: lobby,
      currentUser: hostPlayer
    });
    
    console.log(`✅ Lobby created and synced to Firebase`);
  });

  // Join Lobby Event
  socket.on('join-lobby', async (data) => {
    console.log('\n🔥 ===== JOIN-LOBBY EVENT FIRED =====');
    console.log('Socket ID:', socket.id);
    console.log('Data received:', JSON.stringify(data, null, 2));
    
    const { quizId, playerName, playerAvatar, playerId } = data;
    
    if (!quizId) {
      console.error('❌ No quizId provided!');
      socket.emit('join-error', { message: 'Quiz ID is required' });
      return;
    }
    
    const lobby = lobbies.get(quizId);
    if (!lobby) {
      console.error(`❌ Lobby ${quizId} NOT FOUND!`);
      socket.emit('join-error', { message: 'Lobby not found' });
      return;
    }
    
    if (lobby.status !== 'waiting') {
      console.error(`❌ Lobby ${quizId} has already started`);
      socket.emit('join-error', { message: 'Quiz has already started' });
      return;
    }
    
    console.log(`✅ Lobby found! Current participants: ${lobby.participants.length}`);
    
    // Check for existing player (reconnection)
    if (playerId) {
      const existingPlayer = lobby.participants.find(p => p.id === playerId);
      if (existingPlayer) {
        console.log(`🔄 Player reconnecting: ${playerName}`);
        existingPlayer.socketId = socket.id;
        existingPlayer.status = 'active';
        socket.join(quizId);
        
        // Update in Firebase
        await updatePlayerInFirebase(quizId, playerId, existingPlayer);
        
        // Broadcast update
        io.to(quizId).emit('player-reconnected', {
          player: existingPlayer,
          participants: lobby.participants
        });
        
        socket.emit('lobby-joined', {
          success: true,
          lobby: lobby,
          currentUser: existingPlayer
        });
        
        console.log('✅ Player reconnection completed');
        return;
      }
    }
    
    // Add new player
    const newPlayer = {
      id: playerId || `player_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      socketId: socket.id,
      name: playerName || `Player ${Math.floor(Math.random() * 1000)}`,
      avatar: playerAvatar || Math.floor(Math.random() * 3),
      isHost: false,
      isReady: false,
      score: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      joinedAt: new Date(),
      status: 'active'
    };
    
    lobby.participants.push(newPlayer);
    socket.join(quizId);
    
    console.log(`✅ New player added: ${newPlayer.name}`);
    console.log(`📊 Total participants: ${lobby.participants.length}`);
    
    // Sync to Firebase
    await updatePlayerInFirebase(quizId, newPlayer.id, newPlayer);
    await syncLobbyToFirebase(quizId, {
      participantCount: lobby.participants.length,
      lastPlayerJoined: newPlayer.name
    });
    
    // Broadcast to all participants
    io.to(quizId).emit('player-joined', {
      player: newPlayer,
      participants: lobby.participants
    });
    
    socket.emit('lobby-joined', {
      success: true,
      lobby: lobby,
      currentUser: newPlayer
    });
    
    console.log('✅ New player join completed and synced to Firebase');
    console.log('=====================================\n');
  });

  // Player Ready Event
  socket.on('player-ready', async (data) => {
    const { quizId, isReady } = data;
    
    const lobby = lobbies.get(quizId);
    if (!lobby) return;
    
    const player = lobby.participants.find(p => p.socketId === socket.id);
    if (!player) return;
    
    player.isReady = isReady;
    
    // Update in Firebase
    await updatePlayerInFirebase(quizId, player.id, { isReady });
    
    // Notify all participants
    io.to(quizId).emit('player-ready-updated', {
      playerId: player.id,
      isReady: isReady,
      participants: lobby.participants
    });
  });

  // Update Player Score Event (NEW)
  socket.on('update-score', async (data) => {
    const { quizId, playerId, score, correctAnswers, wrongAnswers, questionIndex } = data;
    
    console.log(`📊 Updating score for player ${playerId}: ${score}`);
    
    const lobby = lobbies.get(quizId);
    if (!lobby) return;
    
    const player = lobby.participants.find(p => p.id === playerId || p.socketId === socket.id);
    if (!player) return;
    
    // Update player score
    player.score = score || 0;
    player.correctAnswers = correctAnswers || 0;
    player.wrongAnswers = wrongAnswers || 0;
    player.lastAnsweredQuestion = questionIndex;
    player.lastScoreUpdate = new Date();
    
    // Update in Firebase
    await updatePlayerInFirebase(quizId, player.id, {
      score: player.score,
      correctAnswers: player.correctAnswers,
      wrongAnswers: player.wrongAnswers,
      lastAnsweredQuestion: questionIndex,
      lastScoreUpdate: player.lastScoreUpdate
    });
    
    // Broadcast score update to all participants
    io.to(quizId).emit('score-updated', {
      playerId: player.id,
      playerName: player.name,
      score: player.score,
      correctAnswers: player.correctAnswers,
      wrongAnswers: player.wrongAnswers,
      participants: lobby.participants.map(p => ({
        id: p.id,
        name: p.name,
        score: p.score,
        correctAnswers: p.correctAnswers,
        wrongAnswers: p.wrongAnswers,
        isHost: p.isHost
      }))
    });
    
    console.log(`✅ Score updated for ${player.name}: ${player.score}`);
  });

  // Start Quiz Event
  socket.on('start-quiz', async (data) => {
    const { quizId } = data;
    
    const lobby = lobbies.get(quizId);
    if (!lobby) {
      socket.emit('start-error', { message: 'Lobby not found' });
      return;
    }
    
    const player = lobby.participants.find(p => p.socketId === socket.id);
    if (!player || !player.isHost) {
      socket.emit('start-error', { message: 'Only host can start the quiz' });
      return;
    }
    
    console.log(`🚀 Starting quiz ${quizId} with ${lobby.participants.length} participants`);
    
    lobby.status = 'starting';
    lobby.startedAt = new Date();
    
    // Update status in Firebase
    await syncLobbyToFirebase(quizId, {
      status: 'starting',
      startedAt: lobby.startedAt
    });
    
    // Start countdown
    let countdown = 5;
    const countdownInterval = setInterval(async () => {
      io.to(quizId).emit('countdown', { countdown });
      
      if (countdown <= 0) {
        clearInterval(countdownInterval);
        lobby.status = 'active';
        
        // Update status in Firebase
        await syncLobbyToFirebase(quizId, { status: 'active' });
        
        // Redirect all participants to quiz
        io.to(quizId).emit('quiz-started', {
          quizId: quizId,
          participants: lobby.participants
        });
      }
      countdown--;
    }, 1000);
  });

  // Leave Lobby Event
  socket.on('leave-lobby', async (data) => {
    const { quizId } = data;
    
    const lobby = lobbies.get(quizId);
    if (!lobby) return;
    
    const playerIndex = lobby.participants.findIndex(p => p.socketId === socket.id);
    if (playerIndex === -1) return;
    
    const player = lobby.participants[playerIndex];
    lobby.participants.splice(playerIndex, 1);
    
    socket.leave(quizId);
    
    // Remove from Firebase
    await removePlayerFromFirebase(quizId, player.id);
    
    // Update lobby participant count
    await syncLobbyToFirebase(quizId, {
      participantCount: lobby.participants.length
    });
    
    // Notify remaining participants
    socket.to(quizId).emit('player-left', {
      player: player,
      participants: lobby.participants
    });
    
    // Handle host leaving
    if (player.isHost && lobby.participants.length > 0) {
      lobby.participants[0].isHost = true;
      lobby.hostId = lobby.participants[0].id;
      
      // Update new host in Firebase
      await updatePlayerInFirebase(quizId, lobby.participants[0].id, { isHost: true });
      await syncLobbyToFirebase(quizId, { hostId: lobby.hostId });
      
      io.to(quizId).emit('new-host', {
        newHost: lobby.participants[0],
        participants: lobby.participants
      });
    } else if (lobby.participants.length === 0) {
      // Delete lobby from Firebase
      try {
        await db.collection('lobbies').doc(quizId).delete();
        console.log(`🗑️ Deleted lobby ${quizId} from Firebase`);
      } catch (error) {
        console.error('❌ Failed to delete lobby from Firebase:', error);
      }
      lobbies.delete(quizId);
    }
  });

  // Disconnect Event
  socket.on('disconnect', async () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
    
    // Remove player from all lobbies
    for (const [lobbyId, lobby] of lobbies.entries()) {
      const playerIndex = lobby.participants.findIndex(p => p.socketId === socket.id);
      if (playerIndex !== -1) {
        const player = lobby.participants[playerIndex];
        
        // Mark as disconnected instead of removing immediately
        player.status = 'disconnected';
        player.disconnectedAt = new Date();
        
        // Update in Firebase
        await updatePlayerInFirebase(lobbyId, player.id, {
          status: 'disconnected',
          disconnectedAt: player.disconnectedAt
        });
        
        // Notify remaining participants
        socket.to(lobbyId).emit('player-disconnected', {
          player: player,
          participants: lobby.participants
        });

        // If host disconnected, assign new host
        if (player.isHost && lobby.participants.filter(p => p.status === 'active').length > 0) {
          const newHost = lobby.participants.find(p => p.status === 'active');
          if (newHost) {
            newHost.isHost = true;
            lobby.hostId = newHost.id;
            
            await updatePlayerInFirebase(lobbyId, newHost.id, { isHost: true });
            await syncLobbyToFirebase(lobbyId, { hostId: newHost.id });
            
            socket.to(lobbyId).emit('new-host', {
              newHost: newHost,
              participants: lobby.participants
            });
          }
        }
        break;
      }
    }
  });
});

// API Routes
app.get('/api/quiz/:id/status', async (req, res) => {
  const { id } = req.params;
  
  try {
    // Get from Firebase
    const lobbyDoc = await db.collection('lobbies').doc(id).get();
    if (!lobbyDoc.exists) {
      return res.status(404).json({ error: 'Lobby not found' });
    }
    
    const lobbyData = lobbyDoc.data();
    
    // Get participants
    const participantsSnapshot = await db.collection('lobbies').doc(id).collection('participants').get();
    const participants = [];
    participantsSnapshot.forEach(doc => {
      participants.push({ id: doc.id, ...doc.data() });
    });
    
    res.json({
      ...lobbyData,
      participants: participants.length,
      participantsList: participants.map(p => ({
        id: p.id,
        name: p.name,
        isHost: p.isHost,
        isReady: p.isReady,
        score: p.score || 0,
        correctAnswers: p.correctAnswers || 0,
        wrongAnswers: p.wrongAnswers || 0,
        status: p.status
      }))
    });
  } catch (error) {
    console.error('❌ Failed to get lobby status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get leaderboard for a lobby
app.get('/api/quiz/:id/leaderboard', async (req, res) => {
  const { id } = req.params;
  
  try {
    const participantsSnapshot = await db.collection('lobbies').doc(id).collection('participants')
      .orderBy('score', 'desc')
      .get();
    
    const leaderboard = [];
    participantsSnapshot.forEach(doc => {
      const data = doc.data();
      leaderboard.push({
        id: doc.id,
        name: data.name,
        score: data.score || 0,
        correctAnswers: data.correctAnswers || 0,
        wrongAnswers: data.wrongAnswers || 0,
        avatar: data.avatar,
        isHost: data.isHost
      });
    });
    
    res.json({ leaderboard });
  } catch (error) {
    console.error('❌ Failed to get leaderboard:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

const PORT = process.env.PORT || 5000;

app.get("/health", (req, res) => {
  res.json({ 
    status: "Node.js backend with Socket.IO and Firebase is running", 
    port: PORT,
    activeLobbies: lobbies.size,
    endpoints: [
      "GET /health",
      "POST /api/upload",
      "GET /api/quiz/:id/status",
      "GET /api/quiz/:id/leaderboard",
      "GET /api/lobbies"
    ],
    socketEvents: [
      "create-lobby",
      "join-lobby", 
      "leave-lobby",
      "player-ready",
      "start-quiz",
      "update-score"
    ]
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Node backend with Socket.IO and Firebase running on http://localhost:${PORT}`);
  console.log(`🔗 Socket.IO server ready for connections`);
  console.log(`🔥 Firebase integration active`);
});