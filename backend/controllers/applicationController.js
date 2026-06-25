import Application from "../models/Application.js";
import Gig from "../models/Gig.js";
import User from "../models/User.js";
import Rating from "../models/Rating.js";
import { getIo } from "../utils/socket.js";
import { notifyUser } from "../utils/notifyUser.js";

export const applyToGig = async (req, res) => {
  try {
    if (req.user.role !== "worker") {
      return res.status(403).json({ message: "Only workers can apply" });
    }
    const gig = await Gig.findById(req.params.gigId);
    if (!gig || gig.removedByAdmin) {
      return res.status(404).json({ message: "Gig not found" });
    }
    if (gig.status !== "open") {
      return res.status(400).json({ message: "Gig is not open for applications" });
    }

    let application;
    try {
      application = await Application.create({
        gig: gig._id,
        seeker: req.user._id,
        status: "pending",
      });
    } catch (e) {
      if (e.code === 11000) {
        return res.status(400).json({ message: "You already applied to this gig" });
      }
      throw e;
    }

    await notifyUser(gig.business, {
      title: "New application",
      message: `${req.user.name} applied to "${gig.title}"`,
      meta: { gigId: gig._id, applicationId: application._id },
    });

    res.status(201).json({ application });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};

export const listMyApplications = async (req, res) => {
  try {
    const apps = await Application.find({ seeker: req.user._id })
      .populate("gig")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ applications: apps });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const listApplicationsForGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.gigId);
    if (!gig) return res.status(404).json({ message: "Gig not found" });
    if (String(gig.business) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not your gig" });
    }
    const apps = await Application.find({ gig: gig._id })
      .populate("seeker", "name email phone skills averageRating ratingCount experienceYears")
      .sort({ createdAt: -1 })
      .lean();
    res.json({ applications: apps });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const app = await Application.findById(req.params.id).populate("gig");
    if (!app) return res.status(404).json({ message: "Application not found" });
    if (String(app.gig.business) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not allowed" });
    }

    app.status = status;
    const io = getIo();

    if (status === "accepted") {
      app.chatEnabled = true;
      await Gig.findByIdAndUpdate(app.gig._id, { status: "filled" });

      const otherPending = await Application.find({
        gig: app.gig._id,
        _id: { $ne: app._id },
        status: "pending",
      });

      for (const other of otherPending) {
        other.status = "rejected";
        await other.save();
        await notifyUser(other.seeker, {
          title: "Application Status",
          message: `Your application for "${app.gig.title}" was not selected this time. Don't worry, there are many more gigs nearby! Apply to the next one now.`,
          meta: { gigId: app.gig._id },
        });
        if (io) {
          io.to(`user:${other.seeker}`).emit("application:updated", {
            applicationId: other._id,
            status: "rejected",
          });
        }
      }

      await notifyUser(app.seeker, {
        title: "Application accepted",
        message: `Your application for "${app.gig.title}" was accepted. Chat is now open.`,
        meta: { applicationId: app._id },
      });
    } else if (status === "rejected") {
      await notifyUser(app.seeker, {
        title: "Application Status",
        message: `Your application for "${app.gig.title}" was not selected this time. Don't worry, there are many more gigs nearby! Apply to the next one now.`,
        meta: { gigId: app.gig._id },
      });
    }

    await app.save();

    if (io) {
      io.to(`user:${app.seeker}`).emit("application:updated", {
        applicationId: app._id,
        status,
      });
    }

    res.json({ application: app });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const completeGigAndRate = async (req, res) => {
  try {
    if (req.user.role !== "business") {
      return res.status(403).json({ message: "Only business can complete and rate" });
    }
    const { applicationId, workQuality, behavior } = req.body;
    const app = await Application.findById(applicationId).populate("gig");
    if (!app) return res.status(404).json({ message: "Application not found" });
    if (String(app.gig.business) !== String(req.user._id)) {
      return res.status(403).json({ message: "Not your gig" });
    }
    if (app.status !== "accepted") {
      return res.status(400).json({ message: "Application must be accepted first" });
    }

    const wq = Number(workQuality);
    const bh = Number(behavior);
    if (wq < 1 || wq > 5 || bh < 1 || bh > 5) {
      return res.status(400).json({ message: "Ratings must be 1–5" });
    }

    await Rating.create({
      worker: app.seeker,
      business: req.user._id,
      gig: app.gig._id,
      application: app._id,
      workQuality: wq,
      behavior: bh,
    });

    const worker = await User.findById(app.seeker);
    const prevAvg = worker.averageRating || 0;
    const prevCount = worker.ratingCount || 0;
    const newAvg = (prevAvg * prevCount + (wq + bh) / 2) / (prevCount + 1);
    worker.averageRating = Math.round(newAvg * 10) / 10;
    worker.ratingCount = prevCount + 1;
    await worker.save();

    app.status = "completed";
    await app.save();
    await Gig.findByIdAndUpdate(app.gig._id, { status: "completed" });

    await notifyUser(app.seeker, {
      title: "Work completed",
      message: `Gig "${app.gig.title}" marked complete. You were rated.`,
      meta: { gigId: app.gig._id },
    });

    res.json({ message: "Completed and rated" });
  } catch (e) {
    if (e.code === 11000) {
      return res.status(400).json({ message: "Already rated for this gig" });
    }
    console.error(e);
    res.status(500).json({ message: e.message });
  }
};
