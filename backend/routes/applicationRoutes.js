import express from "express";
import {
  applyToGig,
  listMyApplications,
  listApplicationsForGig,
  updateApplicationStatus,
  completeGigAndRate,
} from "../controllers/applicationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/gig/:gigId", protect, applyToGig);
router.get("/mine", protect, listMyApplications);
router.get("/gig/:gigId/list", protect, listApplicationsForGig);
router.patch("/:id/status", protect, updateApplicationStatus);
router.post("/complete-rate", protect, completeGigAndRate);

export default router;
