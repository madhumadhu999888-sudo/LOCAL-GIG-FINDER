import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import User from "../models/User.js";

const run = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("Set MONGO_URI in .env");
    process.exit(1);
  }
  await mongoose.connect(uri);

  const email = (process.env.ADMIN_EMAIL || "admin@LocalGigFinder.local").toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "Admin@123";
  const name = process.env.ADMIN_NAME || "System Admin";

  const existing = await User.findOne({ email });
  if (existing) {
    console.log("Admin already exists:", email);
    await mongoose.disconnect();
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await User.create({
    name,
    email,
    password: hashed,
    role: "admin",
  });

  console.log("Admin created:", email);
  console.log("Change ADMIN_PASSWORD in production.");
  await mongoose.disconnect();
};

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
