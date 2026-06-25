import express from "express";
import { listNotifications, markRead, clearAll } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, listNotifications);
router.patch("/:id/read", protect, markRead);
router.delete("/clear", protect, clearAll);

export default router;
