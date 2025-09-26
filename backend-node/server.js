const express = require("express");
const http = require("http");
const socketIo = require("socket.io");
const cors = require("cors");
const uploadRoutes = require("./routes/upload");

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:8000"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Allow Next dev origin (adjust if needed)
app.use(cors({ 
  origin: ["http://localhost:3000", "http://localhost:8000"], // Frontend + Python backend
  credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Add this for form data

// Mount upload routes at /api
app.use("/api", uploadRoutes);

const PORT = process.env.PORT || 5000;

// --- Socket.IO events example ---
io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("Socket disconnected:", socket.id);
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "Node.js backend is running", 
    port: PORT,
    endpoints: [
      "GET /health",
      "GET /api/test", 
      "GET /api/health",
      "POST /api/upload"
    ]
  });
});

// IMPORTANT: Use server.listen, not app.listen!
server.listen(PORT, () => {
  console.log(`Node backend running on http://localhost:${PORT}`);
  console.log(`Socket.IO server ready for connections`);
  console.log(`Upload endpoint available at: http://localhost:${PORT}/api/upload`);
});