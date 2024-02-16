import express from "express";

import {
  getConversations,
  getMessages,
  sendMessage,
} from "../controllers/messageControllers";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.route("/").get(protect, getConversations);
router.route("/:pid/:uid").post(protect, sendMessage).get(protect, getMessages);

export default router;
