import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["worker", "business", "admin"],
      required: true,
    },
    // Worker / Job Seeker
    skills: [{ type: String, trim: true }],
    experienceYears: { type: Number, min: 0, max: 60 },
    preferredJobType: { type: String, trim: true },
    phone: { type: String, trim: true },
    location: locationSchema,
    // Business Owner
    businessName: { type: String, trim: true },
    businessCategory: { type: String, trim: true },
    contactNumber: { type: String, trim: true },
    businessLocation: locationSchema,
    gstNumber: { type: String, trim: true, uppercase: true },
    // Ratings aggregate (from completed gigs)
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);


userSchema.index({ role: 1 });

export default mongoose.model("User", userSchema);
