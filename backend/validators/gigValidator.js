export const validateGigBody = (body) => {
  const {
    title,
    description,
    payType,
    rate,
    skillsRequired,
    longitude,
    latitude,
  } = body;
  if (!title || String(title).trim().length < 2) {
    return "Title is required";
  }
  if (!description || String(description).trim().length < 10) {
    return "Description is required (min 10 chars)";
  }
  if (!["hourly", "daily"].includes(payType)) {
    return "payType must be hourly or daily";
  }
  const r = Number(rate);
  if (Number.isNaN(r) || r < 0) return "Valid rate is required";
  const lat = Number(latitude);
  const lng = Number(longitude);
  if (Number.isNaN(lat) || lat < -90 || lat > 90) return "Invalid latitude";
  if (Number.isNaN(lng) || lng < -180 || lng > 180) return "Invalid longitude";
  if (!Array.isArray(skillsRequired)) return "skillsRequired must be an array";
  return null;
};
