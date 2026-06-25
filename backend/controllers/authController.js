import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";
import {
  validateName, validateEmail, validatePassword,
  validatePhoneIndia, validateLocation, validateGstOptional, validateSkills,
} from "../validators/authValidator.js";


const fail = (res, code, msg) => res.status(code).json({ message: msg });
const guard = (res, validator, value) => { const e = validator(value); return e ? (fail(res, 400, e), true) : false; };

const buildWorkerPayload = (b) => {
  const es = validateSkills(b.skills); if (es) return { error: es };
  const ep = validatePhoneIndia(b.phone); if (ep) return { error: ep };
  const el = validateLocation(b.location); if (el) return { error: el };
  return { data: {
    skills: b.skills.map(s => String(s).trim()).filter(Boolean),
    experienceYears: Number(b.experienceYears) || 0,
    preferredJobType: String(b.preferredJobType || "").trim(),
    phone: String(b.phone).trim(),
    location: { latitude: Number(b.location.latitude), longitude: Number(b.location.longitude) },
  }};
};

const buildBusinessPayload = (b) => {
  if (!b.businessName || String(b.businessName).trim().length < 2) return { error: "Business name is required" };
  if (!b.contactNumber) return { error: "Contact number is required" };
  const ep = validatePhoneIndia(b.contactNumber); if (ep) return { error: ep };
  const el = validateLocation(b.businessLocation); if (el) return { error: el };
  const eg = validateGstOptional(b.gstNumber); if (eg) return { error: eg };
  return { data: {
    businessName: String(b.businessName).trim(),
    businessCategory: String(b.businessCategory || "").trim(),
    contactNumber: String(b.contactNumber).trim(),
    businessLocation: { latitude: Number(b.businessLocation.latitude), longitude: Number(b.businessLocation.longitude) },
    gstNumber: b.gstNumber ? String(b.gstNumber).trim().toUpperCase() : undefined,
  }};
};

// ── Register ──
export const register = async (req, res) => {
  try {
    const { name, email, password, confirmPassword, role } = req.body;
    if (role === "admin") return fail(res, 403, "Admin accounts are created only by system");
    if (!["worker", "business"].includes(role)) return fail(res, 400, "Invalid role");

    let e;
    if ((e = validateName(name))) return fail(res, 400, e);
    if ((e = validateEmail(email))) return fail(res, 400, e);
    if ((e = validatePassword(password))) return fail(res, 400, e);
    if (password !== confirmPassword) return fail(res, 400, "Passwords do not match");

    if (await User.findOne({ email: email.trim().toLowerCase() }))
      return fail(res, 400, "Email already registered");

    const payload = role === "worker" ? buildWorkerPayload(req.body) : buildBusinessPayload(req.body);
    if (payload.error) return fail(res, 400, payload.error);

    await User.create({
      name: name.trim(), email: email.trim().toLowerCase(),
      password: await bcrypt.hash(password, 12), role, ...payload.data,
    });

    res.status(201).json({ message: "Account created successfully. Please login with your details." });
  } catch (err) {
    console.error(err);
    // Mongoose duplicate key error
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || "field";
      return res.status(400).json({ message: `The ${field} is already registered. Please use a different ${field}.` });
    }
    // Mongoose validation error
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ message: messages.join(". ") });
    }
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

// ── Login: Validate credentials and return JWT directly ──
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    let e;
    if ((e = validateEmail(email))) return fail(res, 400, e);
    if (!password) return fail(res, 400, "Password is required");

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(password, user.password)))
      return fail(res, 401, "Invalid email or password");

    const token = generateToken(user._id, user.role);
    const u = user.toObject(); delete u.password;
    res.json({ token, user: u });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message || "Server error" });
  }
};



// ── Get Me ──
export const getMe = (req, res) => res.json({ user: req.user });
