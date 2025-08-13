// routes/conversations.js
import express from "express";
import Message from "../models/message.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const conversations = await Message.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$wa_id",
          contact_name: { $first: "$contact_name" },
          last_message: { $first: "$body" },
          last_timestamp: { $first: "$timestamp" },
          last_status: { $first: "$status" }
        }
      },
      { $sort: { last_timestamp: -1 } }
    ]);

    // Normalize to Chat interface format
    const formatted = conversations.map(c => ({
      wa_id: c._id,
      name: c.contact_name ?? "Unknown",
      phone: c._id,
      lastMessage: c.last_message ?? "",
      lastMessageTime: c.last_timestamp,
      lastSeen: "",
      unreadCount: 0,
      avatar: ""
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Conversations fetch error:", err);
    res.status(500).json({ error: "Failed to fetch conversations" });
  }
});

export default router;

