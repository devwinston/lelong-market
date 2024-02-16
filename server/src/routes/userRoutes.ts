import express from "express";

import {
  signupUser,
  signinUser,
  getUser,
  updateUser,
  resetUser,
} from "../controllers/userControllers";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.route("/signup").post(signupUser);
router.route("/signin").post(signinUser);
router.route("/:uid").get(protect, getUser).patch(protect, updateUser);
router.route("/reset").post(resetUser);

export default router;
