import mongoose from "mongoose";

const gigSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, required: true, trim: true, maxlength: 5000 },
    business: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    payType: {
      type: String,
      enum: ["hourly", "daily"],
      required: true,
    },
    rate: { type: Number, required: true, min: 0 },
    skillsRequired: [{ type: String, trim: true }],
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    address: { type: String, trim: true },
    status: {
      type: String,
      enum: ["open", "filled", "completed", "cancelled"],
      default: "open",
    },
    removedByAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

gigSchema.index({ location: "2dsphere" });
gigSchema.index({ business: 1, status: 1 });

export default mongoose.model("Gig", gigSchema);
