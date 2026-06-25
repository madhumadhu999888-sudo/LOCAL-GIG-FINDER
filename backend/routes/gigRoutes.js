import express from "express";
import {
  createGig,
  listGigsForBusiness,
  listOpenGigs,
  getGigById,
  updateGigStatus,
  adminRemoveGig,
} from "../controllers/gigController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/open", listOpenGigs);
router.get("/nearby", listOpenGigs);
router.get("/mine/list", protect, allowRoles("business"), listGigsForBusiness);
router.get("/:id", getGigById);

router.post("/", protect, allowRoles("business"), createGig);
router.patch("/:id/status", protect, updateGigStatus);
router.delete("/:id/admin", protect, allowRoles("admin"), adminRemoveGig);

export default router;
