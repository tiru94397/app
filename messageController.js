import Message from "../models/Message.js";

export const saveMessage = async (req, res) => {
  try {
    const { sender, receiver, content } = req.body;
    if (!sender || !receiver || !content) {
      return res.status(400).json({ success: false, error: "Missing fields" });
    }

    const message = new Message({ sender, receiver, content });
    const saved = await message.save();

    // Emit via Socket.IO if req.io available
    try {
      if (req.io) {
        // emit to both sender and receiver rooms so both sides see it
        req.io.to(receiver).emit("new_message", saved);
        req.io.to(sender).emit("new_message", saved);
      }
    } catch (e) {
      console.warn("Socket emit failed:", e.message);
    }

    res.status(201).json({ success: true, message: saved });
  } catch (err) {
    console.error("saveMessage error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

export const getMessagesBetween = async (req, res) => {
  try {
    const { user1, user2 } = req.params;
    if (!user1 || !user2) {
      return res.status(400).json({ success: false, error: "Missing users" });
    }

    const messages = await Message.find({
      $or: [
        { sender: user1, receiver: user2 },
        { sender: user2, receiver: user1 },
      ],
    }).sort({ createdAt: 1 });

    res.json({ success: true, messages });
  } catch (err) {
    console.error("getMessagesBetween error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// optional: get all messages
export const getAllMessages = async (req, res) => {
  try {
    const msgs = await Message.find({}).sort({ createdAt: 1 });
    res.json({ success: true, messages: msgs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
