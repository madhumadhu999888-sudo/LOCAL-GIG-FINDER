import Notification from "../models/Notification.js";

export const listNotifications = async (req, res) => {
  try {
    const items = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json({ notifications: items });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const markRead = async (req, res) => {
  try {
    const updated = await Notification.findOneAndUpdate(
      { user: req.user._id, _id: req.params.id },
      { read: true },
      { new: true }
    );
    if (!updated) return res.status(404).json({ message: "Notification not found" });
    res.json({ ok: true, notification: updated });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const clearAll = async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.json({ ok: true, message: "All notifications cleared." });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
