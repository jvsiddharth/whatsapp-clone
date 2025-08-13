
import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  wa_id: String,
  contact_name: String,
  message_id: { type: String, unique: true },
  direction: String,
  type: String,
  body: String,
  timestamp: Date,
  status: { type: String, default: "sent" },
  phone_number_id: String,
  display_phone_number: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Message", MessageSchema);

