import express from "express";
import {
  dashboardStats, listUsers, listAllGigs,
  listAllMessages, listAllApplications,
} from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { allowRoles } from "../middleware/roleMiddleware.js";

const router = express.Router();
router.use(protect, allowRoles("admin"));

router.get("/stats", dashboardStats);
router.get("/users", listUsers);
router.get("/gigs", listAllGigs);
router.get("/messages", listAllMessages);
router.get("/applications", listAllApplications);

export default router;
