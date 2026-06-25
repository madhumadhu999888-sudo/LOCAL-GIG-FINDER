import express from "express";
import { updateProfile, getWorkerPublic } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/profile", protect, updateProfile);
router.get("/worker/:id", getWorkerPublic);

export default router;
