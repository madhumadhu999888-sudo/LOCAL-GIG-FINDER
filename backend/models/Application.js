import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema(
  {
    gig: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gig",
      required: true,
    },
    seeker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected", "completed"],
      default: "pending",
    },
    chatEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

applicationSchema.index({ gig: 1, seeker: 1 }, { unique: true });

export default mongoose.model("Application", applicationSchema);
