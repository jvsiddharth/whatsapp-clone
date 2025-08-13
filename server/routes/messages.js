// routes/messages.js
import express from "express";
import Message from "../models/message.js";

const router = express.Router();

router.get("/:wa_id", async (req, res) => {
  try {
    const { wa_id } = req.params;

    const messages = await Message.find({ wa_id })
      .sort({ timestamp: 1 }); // oldest to newest

    res.json(messages);
  } catch (err) {
    console.error("Messages fetch error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

export default router;
