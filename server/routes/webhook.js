import express from "express";
import Message from "../models/message.js";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const payload = req.body;

    for (const entry of payload.metaData.entry || []) {
      for (const change of entry.changes || []) {
        const value = change.value || {};

        // Handling New Messages
        if (change.field === "messages" && value.messages) {
          for (const msg of value.messages) {
            // Skip if msg_id is missing
            if (!msg.msg_id) continue;

            await Message.updateOne(
              { message_id: msg.msg_id },
              {
                $setOnInsert: {
                  wa_id: value.contacts?.[0]?.wa_id || "",
                  contact_name: value.contacts?.[0]?.profile?.name || "",
                  message_id: msg.msg_id,
                  direction:
                    msg.from === value.contacts?.[0]?.wa_id
                      ? "incoming"
                      : "outgoing",
                  type: msg.type,
                  body: msg.text?.body || "",
                  timestamp: new Date(parseInt(msg.timestamp) * 1000),
                  phone_number_id: value.metadata?.phone_number_id || "",
                  display_phone_number:
                    value.metadata?.display_phone_number || "",
                  status: "sent",
                },
              },
              { upsert: true }
            );
          }
        }

        // Handling Status Updates
        if (change.field === "messages" && value.statuses) {
          for (const status of value.statuses) {
            // WhatsApp sometimes sends status.id instead of status.msg_id
            const statusId = status.msg_id || status.id;
            if (!statusId) continue;

            await Message.updateOne(
              { message_id: statusId },
              { $set: { status: status.status } }
            );
          }
        }
      }
    }

    res.sendStatus(200);
  } catch (err) {
    console.error("Webhook error:", err);
    res.status(500).json({ error: "Webhook processing failed" });
  }
});

export default router;

