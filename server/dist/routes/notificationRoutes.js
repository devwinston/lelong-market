"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const notificationControllers_1 = require("../controllers/notificationControllers");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router
    .route("/:uid")
    .get(authMiddleware_1.protect, notificationControllers_1.getUserNotifications)
    .patch(authMiddleware_1.protect, notificationControllers_1.readUserNotifications);
exports.default = router;
