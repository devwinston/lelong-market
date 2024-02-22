"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.readUserNotifications = exports.getUserNotifications = void 0;
const db_1 = __importDefault(require("../db"));
// @desc get user notifications
// @route GET /api/notifications/:uid
// @access private 2
const getUserNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid: receiverUid } = req.params;
    // const requestorUid = req.uid;
    try {
        // if (requestorUid !== receiverUid)
        //   throw new Error("Notifications not authorised");
        const q = "SELECT * FROM notifications WHERE receiverUid = $1 ORDER BY created DESC";
        const v = [receiverUid];
        const result = yield db_1.default.query(q, v);
        const notifications = result.rows;
        res.status(200).json(notifications);
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Unable to get listings",
        });
    }
});
exports.getUserNotifications = getUserNotifications;
// @desc read user notifications
// @route PATCH /api/notifications/:uid
// @access private 2
const readUserNotifications = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid: receiverUid } = req.params;
    // const requestorUid = req.uid;
    try {
        // if (requestorUid !== receiverUid)
        //   throw new Error("Notifications not authorised");
        const q = "UPDATE notifications SET unread = FALSE WHERE receiverUid = $1 RETURNING *";
        const v = [receiverUid];
        const result = yield db_1.default.query(q, v);
        const notifications = result.rows;
        res.status(200).json(notifications);
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Unable to get listings",
        });
    }
});
exports.readUserNotifications = readUserNotifications;
