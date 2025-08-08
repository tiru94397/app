import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
import messageRoutes from "./routes/messageRoutes.js";
import connectDB from "./config/db.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(cors());
app.use(express.json());

// Attach io to req so controllers can emit
app.use((req, res, next) => {
  req.io = io;
  next();
});

// API routes
app.use("/api", messageRoutes);

// Serve static frontend files from `public` folder
const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

// fallback to index.html for client-side routing
app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("🔌 Socket connected:", socket.id);

  // Join room named by user id so server can target messages
  socket.on("join", (userId) => {
    if (!userId) return;
    socket.join(userId);
    console.log(`📥 ${userId} joined room: ${socket.id}`);
  });

  socket.on("disconnect", () => {
    console.log("🔌 Socket disconnected:", socket.id);
  });

  // optional: handle typing indicator
  socket.on("typing", ({ sender, receiver }) => {
    if (receiver) {
      io.to(receiver).emit("user_typing", { sender });
    }
  });
});

// Connect DB then start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch((err) => {
  // If connectDB didn't exit, still try to start
  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT} (DB error above)`);
  });
});
