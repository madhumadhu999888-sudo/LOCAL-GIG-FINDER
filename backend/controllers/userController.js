import User from "../models/User.js";
import {
  validateName,
  validatePhoneIndia,
  validateLocation,
  validateGstOptional,
  validateSkills,
} from "../validators/authValidator.js";

export const updateProfile = async (req, res) => {
  try {
    const u = await User.findById(req.user._id);
    if (!u) return res.status(404).json({ message: "User not found" });

    if (req.body.name !== undefined) {
      const nameErr = validateName(req.body.name);
      if (nameErr) return res.status(400).json({ message: nameErr });
      u.name = String(req.body.name).trim();
    }

    if (u.role === "worker") {
      if (req.body.phone !== undefined) {
        const phoneErr = validatePhoneIndia(req.body.phone);
        if (phoneErr) return res.status(400).json({ message: phoneErr });
        u.phone = String(req.body.phone).trim();
      }
      if (req.body.skills !== undefined) {
        const skillsErr = validateSkills(req.body.skills);
        if (skillsErr) return res.status(400).json({ message: skillsErr });
        u.skills = req.body.skills.map((s) => String(s).trim()).filter(Boolean);
      }
      if (req.body.preferredJobType !== undefined) {
        u.preferredJobType = String(req.body.preferredJobType || "").trim();
      }
      if (req.body.experienceYears !== undefined) {
        u.experienceYears = Math.max(0, Math.min(60, Number(req.body.experienceYears) || 0));
      }
      if (req.body.location) {
        const locErr = validateLocation(req.body.location);
        if (locErr) return res.status(400).json({ message: locErr });
        u.location = {
          latitude: Number(req.body.location.latitude),
          longitude: Number(req.body.location.longitude),
        };
      }
    }

    if (u.role === "business") {
      if (req.body.businessName !== undefined) {
        const bn = String(req.body.businessName).trim();
        if (bn.length < 2) return res.status(400).json({ message: "Business name is required" });
        u.businessName = bn;
      }
      if (req.body.businessCategory !== undefined) {
        u.businessCategory = String(req.body.businessCategory || "").trim();
      }
      if (req.body.contactNumber !== undefined) {
        const phoneErr = validatePhoneIndia(req.body.contactNumber);
        if (phoneErr) return res.status(400).json({ message: phoneErr });
        u.contactNumber = String(req.body.contactNumber).trim();
      }
      if (req.body.gstNumber !== undefined) {
        const gstErr = validateGstOptional(req.body.gstNumber);
        if (gstErr) return res.status(400).json({ message: gstErr });
        u.gstNumber = req.body.gstNumber
          ? String(req.body.gstNumber).trim().toUpperCase()
          : undefined;
      }
      if (req.body.businessLocation) {
        const locErr = validateLocation(req.body.businessLocation);
        if (locErr) return res.status(400).json({ message: locErr });
        u.businessLocation = {
          latitude: Number(req.body.businessLocation.latitude),
          longitude: Number(req.body.businessLocation.longitude),
        };
      }
    }

    await u.save();
    const out = u.toObject();
    delete out.password;
    res.json({ user: out });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const getWorkerPublic = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: "worker",
    }).select("name skills averageRating ratingCount experienceYears preferredJobType phone");
    if (!user) return res.status(404).json({ message: "Not found" });
    res.json({ user });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
