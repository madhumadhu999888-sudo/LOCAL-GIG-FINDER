import Message from "../models/Message.js";
import Application from "../models/Application.js";
import Gig from "../models/Gig.js";
import { getIo } from "../utils/socket.js";
import { notifyUser } from "../utils/notifyUser.js";

export const listMessages = async (req, res) => {
  try {
    const app = await Application.findById(req.params.applicationId);
    if (!app) return res.status(404).json({ message: "Not found" });
    const uid = String(req.user._id);
    const seekerId = String(app.seeker);
    const gig = await Gig.findById(app.gig);
    if (!gig) return res.status(404).json({ message: "Gig missing" });
    const bizId = String(gig.business);
    if (uid !== seekerId && uid !== bizId) {
      return res.status(403).json({ message: "Not allowed" });
    }
    if (!app.chatEnabled && uid === seekerId) {
      return res.status(403).json({ message: "Chat not enabled yet" });
    }

    const messages = await Message.find({ application: app._id })
      .sort({ createdAt: 1 })
      .populate("sender", "name role")
      .lean();
    res.json({ messages });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || String(text).trim().length < 1) {
      return res.status(400).json({ message: "Message text required" });
    }
    const app = await Application.findById(req.params.applicationId);
    if (!app) return res.status(404).json({ message: "Not found" });
    const gig = await Gig.findById(app.gig);
    if (!gig) return res.status(404).json({ message: "Gig missing" });

    const uid = String(req.user._id);
    const seekerId = String(app.seeker);
    const bizId = String(gig.business);
    if (uid !== seekerId && uid !== bizId) {
      return res.status(403).json({ message: "Not allowed" });
    }
    if (!app.chatEnabled) {
      return res.status(403).json({ message: "Chat is only available after acceptance" });
    }

    const msg = await Message.create({
      application: app._id,
      sender: req.user._id,
      text: String(text).trim(),
    });
    const populated = await Message.findById(msg._id)
      .populate("sender", "name role")
      .lean();

    const io = getIo();
    if (io) {
      io.to(`app:${String(app._id)}`).emit("message:new", {
        applicationId: String(app._id),
        message: populated,
      });
    }

    const recipientId = uid === seekerId ? bizId : seekerId;
    await notifyUser(recipientId, {
      title: "New message",
      message: `${req.user.name} sent a message about "${gig.title}"`,
      meta: { applicationId: app._id, gigId: gig._id },
    });

    res.status(201).json({ message: populated });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
