"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const messageControllers_1 = require("../controllers/messageControllers");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route("/").get(authMiddleware_1.protect, messageControllers_1.getConversations);
router.route("/:pid/:uid").post(authMiddleware_1.protect, messageControllers_1.sendMessage).get(authMiddleware_1.protect, messageControllers_1.getMessages);
exports.default = router;
