"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userControllers_1 = require("../controllers/userControllers");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route("/signup").post(userControllers_1.signupUser);
router.route("/signin").post(userControllers_1.signinUser);
router.route("/:uid").get(authMiddleware_1.protect, userControllers_1.getUser).patch(authMiddleware_1.protect, userControllers_1.updateUser);
router.route("/reset").post(userControllers_1.resetUser);
exports.default = router;
