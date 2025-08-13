import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import { WebSocketServer } from "ws"; // npm install ws

import webhookRoutes from "./routes/webhook.js";
import conversationsRoutes from "./routes/conversations.js";
import messagesRoutes from "./routes/messages.js";

dotenv.config();
const app = express();
app.use(express.json());

// ✅ More complete CORS config
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ Explicitly respond to OPTIONS preflight
app.options(/.*/, cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));



// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.error("Mongo error", err));

// Routes
app.use("/api/webhook", webhookRoutes);
app.use("/api/conversations", conversationsRoutes);
app.use("/api/messages", messagesRoutes);

// Create HTTP server
const server = app.listen(3000, () => console.log("Server running on port 3000"));

// Attach WebSocket server
const wss = new WebSocketServer({ server });
wss.on("connection", (ws) => {
  console.log("New WebSocket client connected");

  ws.on("message", (message) => {
    console.log("Received:", message.toString());
    ws.send(`Echo: ${message}`);
  });

  ws.on("close", () => console.log("Client disconnected"));
});

