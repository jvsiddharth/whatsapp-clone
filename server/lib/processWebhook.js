const Message = require('../models/message');

/**
 * Process incoming webhook payload
 * @param {Object} payload - The webhook JSON
 * @param {Object} io - socket.io server instance (for realtime emit)
 */
async function processWebhook(payload, io) {
  // TODO: adapt to actual payload structure
  // Example for message insert:
  if (payload.type === 'message') {
    const msg = new Message({
      msg_id: payload.id,
      wa_id: payload.wa_id,
      from: payload.from,
      to: payload.to,
      direction: payload.direction,
      type: payload.message_type,
      text: payload.text,
      payload_raw: payload,
      status: 'sent',
      timestamp: new Date(payload.timestamp * 1000),
      status_history: [{ status: 'sent' }]
    });
    await msg.save();
    io.emit('message:new', msg);
    return { inserted: true, msg_id: msg.msg_id };
  }

  // Example for status update:
  if (payload.type === 'status') {
    await Message.updateOne(
      { msg_id: payload.id },
      {
        $set: { status: payload.status },
        $push: { status_history: { status: payload.status } }
      }
    );
    io.emit('message:status', { id: payload.id, status: payload.status });
    return { updated: true, msg_id: payload.id };
  }

  return { ignored: true };
}

module.exports = processWebhook;
