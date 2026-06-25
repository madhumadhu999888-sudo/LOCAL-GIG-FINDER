import User from "../models/User.js";
import Gig from "../models/Gig.js";
import Application from "../models/Application.js";
import Message from "../models/Message.js";

export const dashboardStats = async (req, res) => {
  try {
    const [workers, businesses, gigs, applications, messages] = await Promise.all([
      User.countDocuments({ role: "worker" }),
      User.countDocuments({ role: "business" }),
      Gig.countDocuments({ removedByAdmin: false }),
      Application.countDocuments(),
      Message.countDocuments(),
    ]);
    res.json({ workers, businesses, gigs, applications, messages });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    const users = await User.find(filter)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
    res.json({ users });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listAllGigs = async (req, res) => {
  try {
    const gigs = await Gig.find()
      .populate("business", "name businessName email")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();

    // Attach application count per gig
    const gigIds = gigs.map(g => g._id);
    const appCounts = await Application.aggregate([
      { $match: { gig: { $in: gigIds } } },
      { $group: { _id: "$gig", count: { $sum: 1 } } },
    ]);
    const countMap = Object.fromEntries(appCounts.map(a => [String(a._id), a.count]));
    const enriched = gigs.map(g => ({ ...g, applicationCount: countMap[String(g._id)] || 0 }));

    res.json({ gigs: enriched });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listAllMessages = async (req, res) => {
  try {
    const messages = await Message.find()
      .populate("sender", "name email role")
      .populate({
        path: "application",
        select: "gig seeker status",
        populate: [
          { path: "gig", select: "title" },
          { path: "seeker", select: "name email" },
        ],
      })
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
    res.json({ messages });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("seeker", "name email phone skills averageRating")
      .populate("gig", "title rate payType status address")
      .sort({ createdAt: -1 })
      .limit(500)
      .lean();
    res.json({ applications });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
