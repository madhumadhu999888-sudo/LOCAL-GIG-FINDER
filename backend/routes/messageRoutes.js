import express from "express";
import { listMessages, sendMessage } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/:applicationId", protect, listMessages);
router.post("/:applicationId", protect, sendMessage);

export default router;
