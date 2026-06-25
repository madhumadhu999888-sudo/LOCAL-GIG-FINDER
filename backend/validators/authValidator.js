const NAME_RE = /^[a-zA-Z\s'.-]{3,50}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PASSWORD_RE =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{6,10}$/;
const PHONE_IN_RE = /^[6-9]\d{9}$/;
const GST_RE = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

export const validateName = (name) => {
  if (!name || typeof name !== "string") return "Name is required";
  const t = name.trim();
  if (t.length < 3 || t.length > 50) return "Name must be 3–50 characters";
  if (!NAME_RE.test(t)) return "Name may only contain letters, spaces, and . ' -";
  return null;
};

export const validateEmail = (email) => {
  if (!email || typeof email !== "string") return "Email is required";
  if (!EMAIL_RE.test(email.trim())) return "Invalid email format";
  return null;
};

export const validatePassword = (password) => {
  if (!password) return "Password is required";
  if (password.length < 6 || password.length > 10) {
    return "Password must be 6–10 characters";
  }
  if (!PASSWORD_RE.test(password)) {
    return "Password needs uppercase, lowercase, number, and special character";
  }
  return null;
};

export const validatePhoneIndia = (phone) => {
  if (!phone || typeof phone !== "string") return "Phone number is required";
  if (!PHONE_IN_RE.test(phone.trim())) {
    return "Phone must be 10 digits starting with 6–9";
  }
  return null;
};

export const validateLocation = (loc) => {
  if (!loc || typeof loc !== "object") return "Location is required";
  const { latitude, longitude } = loc;
  if (latitude === undefined || longitude === undefined) {
    return "Latitude and longitude are required";
  }
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (Number.isNaN(lat) || lat < -90 || lat > 90) return "Invalid latitude";
  if (Number.isNaN(lng) || lng < -180 || lng > 180) return "Invalid longitude";
  return null;
};

export const validateGstOptional = (gst) => {
  if (!gst || String(gst).trim() === "") return null;
  const g = String(gst).trim().toUpperCase();
  if (!GST_RE.test(g)) return "Invalid GST format";
  return null;
};

export const validateSkills = (skills) => {
  if (!Array.isArray(skills) || skills.length < 1) {
    return "Select at least one skill";
  }
  const cleaned = skills.map((s) => String(s).trim()).filter(Boolean);
  if (cleaned.length < 1) return "Select at least one skill";
  return null;
};
