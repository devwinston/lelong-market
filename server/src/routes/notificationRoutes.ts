import express from "express";

import {
  getUserNotifications,
  readUserNotifications,
} from "../controllers/notificationControllers";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router
  .route("/:uid")
  .get(protect, getUserNotifications)
  .patch(protect, readUserNotifications);

export default router;
