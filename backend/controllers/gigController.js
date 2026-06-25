import Gig from "../models/Gig.js";
import { validateGigBody } from "../validators/gigValidator.js";

export const createGig = async (req, res) => {
  try {
    if (req.user.role !== "business")
      return res.status(403).json({ message: "Only business owners can post gigs" });
    const err = validateGigBody(req.body);
    if (err) return res.status(400).json({ message: err });

    const { title, description, payType, rate, skillsRequired, latitude, longitude, address } = req.body;
    const gig = await Gig.create({
      title: String(title).trim(),
      description: String(description).trim(),
      business: req.user._id,
      payType, rate: Number(rate),
      skillsRequired: Array.isArray(skillsRequired)
        ? skillsRequired.map(s => String(s).trim()).filter(Boolean) : [],
      location: { type: "Point", coordinates: [Number(longitude), Number(latitude)] },
      address: address ? String(address).trim() : "",
    });
    res.status(201).json({ gig });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message || "Server error" });
  }
};

export const listGigsForBusiness = async (req, res) => {
  try {
    const gigs = await Gig.find({ business: req.user._id }).sort({ createdAt: -1 }).lean();
    res.json({ gigs });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listOpenGigs = async (req, res) => {
  try {
    const { lat, lng, skills, radiusKm } = req.query;
    const radius = Math.min(Number(radiusKm) || 10, 100);
    const filter = { status: "open", removedByAdmin: false };

    if (lat && lng) {
      const la = Number(lat), lo = Number(lng);
      if (!Number.isNaN(la) && !Number.isNaN(lo)) {
        filter.location = {
          $near: { $geometry: { type: "Point", coordinates: [lo, la] }, $maxDistance: radius * 1000 },
        };
      }
    }

    if (skills) {
      const arr = String(skills).split(",").map(s => s.trim()).filter(Boolean);
      if (arr.length) filter.skillsRequired = { $in: arr };
    }

    const gigs = await Gig.find(filter)
      .populate("business", "name businessName email")
      .sort({ createdAt: -1 }).limit(100).lean();
    res.json({ gigs });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};

export const getGigById = async (req, res) => {
  try {
    const gig = await Gig.findOne({ _id: req.params.id, removedByAdmin: false })
      .populate("business", "name businessName email contactNumber");
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    res.json({ gig });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateGigStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    if (String(gig.business) !== String(req.user._id) && req.user.role !== "admin")
      return res.status(403).json({ message: "Not allowed" });
    if (!["open", "filled", "completed", "cancelled"].includes(status))
      return res.status(400).json({ message: "Invalid status" });
    gig.status = status;
    await gig.save();
    res.json({ gig });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const adminRemoveGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    gig.removedByAdmin = true;
    gig.status = "cancelled";
    await gig.save();
    res.json({ message: "Gig removed by admin", gig });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
