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
exports.getConversations = exports.getMessages = exports.sendMessage = void 0;
const uuid_1 = require("uuid");
const db_1 = __importDefault(require("../db"));
const socket_1 = require("../socket/socket");
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pid, uid: receiverUid } = req.params;
    const { text } = req.body;
    const senderUid = req.uid;
    const sender = req.username;
    try {
        // check if product exists
        const q1 = "SELECT * FROM listings WHERE pid = $1";
        const v1 = [pid];
        let result = yield db_1.default.query(q1, v1);
        const listing = result.rows[0];
        if (!listing)
            throw new Error("Listing no longer available");
        // check if conversation exists
        const q2 = "SELECT * FROM conversations WHERE uids @> ARRAY[$1, $2] AND pid = $3";
        const v2 = [senderUid, receiverUid, pid];
        result = yield db_1.default.query(q2, v2);
        const conversation = result.rows[0];
        if (!conversation) {
            // conversation does not exist
            // create message
            const mid = (0, uuid_1.v4)();
            const q3 = "INSERT INTO messages (mid, sender, receiver, text, created) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *";
            const v3 = [mid, senderUid, receiverUid, text];
            let result = yield db_1.default.query(q3, v3);
            const message = result.rows[0];
            // create conversation
            const cid = (0, uuid_1.v4)();
            const q4 = "INSERT INTO conversations (cid, pid, uids, messages, updated) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)";
            const v4 = [cid, pid, [senderUid, receiverUid], [mid]];
            yield db_1.default.query(q4, v4);
            // send notification
            const title = listing.title;
            result = yield db_1.default.query("SELECT username FROM users WHERE uid = $1", [
                receiverUid,
            ]);
            const receiver = result.rows[0].username;
            const nid = (0, uuid_1.v4)();
            const q5 = "INSERT INTO notifications (nid, pid, title, senderUid, sender, receiverUid, receiver, type, unread, created) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, CURRENT_TIMESTAMP)";
            const v5 = [
                nid,
                pid,
                title,
                senderUid,
                sender,
                receiverUid,
                receiver,
                "message",
            ];
            yield db_1.default.query(q5, v5);
            // socket.io
            const receiverSocket = (0, socket_1.getSocket)(receiverUid);
            if (receiverSocket) {
                // io.to(<socketId>) sends events to specific client
                socket_1.io.to(receiverSocket).emit("message", { pid, message });
            }
            res.status(200).json(message);
        }
        else {
            // conversation exists
            // create message
            const mid = (0, uuid_1.v4)();
            const q3 = "INSERT INTO messages (mid, sender, receiver, text, created) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *";
            const v3 = [mid, senderUid, receiverUid, text];
            let result = yield db_1.default.query(q3, v3);
            const message = result.rows[0];
            // add message to conversation
            const cid = conversation.cid;
            const messages = conversation.messages;
            messages.push(mid);
            const q4 = "UPDATE conversations SET (messages, updated) = ($1, CURRENT_TIMESTAMP) WHERE cid = $2";
            const v4 = [messages, cid];
            yield db_1.default.query(q4, v4);
            // send notification
            const title = listing.title;
            result = yield db_1.default.query("SELECT username FROM users WHERE uid = $1", [
                receiverUid,
            ]);
            const receiver = result.rows[0].username;
            // check if notification exists
            result = yield db_1.default.query("SELECT nid FROM notifications WHERE pid = $1 AND senderUid = $2 AND receiverUid = $3 AND type = $4", [pid, senderUid, receiverUid, "message"]);
            if (!result.rows[0]) {
                const nid = (0, uuid_1.v4)();
                const q5 = "INSERT INTO notifications (nid, pid, title, senderUid, sender, receiverUid, receiver, type, unread, created) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, CURRENT_TIMESTAMP)";
                const v5 = [
                    nid,
                    pid,
                    title,
                    senderUid,
                    sender,
                    receiverUid,
                    receiver,
                    "message",
                ];
                yield db_1.default.query(q5, v5);
            }
            else {
                const nid = result.rows[0].nid;
                const q5 = "UPDATE notifications SET (title, unread, created) = ($1, TRUE, CURRENT_TIMESTAMP) WHERE nid = $2";
                const v5 = [title, nid];
                yield db_1.default.query(q5, v5);
            }
            // socket.io
            const receiverSocket = (0, socket_1.getSocket)(receiverUid);
            if (receiverSocket) {
                // io.to(<socketId>) sends events to specific client
                socket_1.io.to(receiverSocket).emit("message", { pid, message });
            }
            res.status(200).json(message);
        }
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Unable to send message",
        });
    }
});
exports.sendMessage = sendMessage;
// @desc get messages
// @route GET /api/messages/:pid/:uid
// @access private
const getMessages = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pid, uid: receiverUid } = req.params;
    const senderUid = req.uid;
    try {
        const q1 = "SELECT messages FROM conversations WHERE uids @> ARRAY[$1, $2] AND pid = $3";
        const v1 = [senderUid, receiverUid, pid];
        const result = yield db_1.default.query(q1, v1);
        const conversation = result.rows[0];
        if (conversation) {
            const mids = conversation.messages;
            const q2 = "SELECT * FROM messages WHERE mid = ANY($1) ORDER BY created";
            const v2 = [mids];
            const result = yield db_1.default.query(q2, v2);
            const messages = result.rows;
            res.status(200).json(messages);
        }
        else {
            res.status(200).json([]);
        }
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Unable to get messages",
        });
    }
});
exports.getMessages = getMessages;
// @desc get conversations
// @route GET /api/messages
// @access private
const getConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const senderUid = req.uid;
    try {
        const q = "SELECT * FROM conversations WHERE $1 = ANY(uids) ORDER BY updated DESC";
        const v = [senderUid];
        const result = yield db_1.default.query(q, v);
        const conversations = result.rows;
        // get additional information
        for (let i = 0; i < conversations.length; i++) {
            const conversation = conversations[i];
            // get receiver information
            const [receiverUid] = conversation.uids.filter((uid) => uid !== senderUid);
            let q = "SELECT username, avatar FROM users WHERE uid = $1";
            let v = [receiverUid];
            let result = yield db_1.default.query(q, v);
            const receiver = result.rows[0];
            conversation["uid"] = receiverUid;
            conversation["username"] = receiver.username;
            conversation["avatar"] = receiver.avatar;
            // get listing information
            const pid = conversation.pid;
            q = "SELECT title, price, images FROM listings WHERE pid = $1";
            v = [pid];
            result = yield db_1.default.query(q, v);
            const listing = result.rows[0];
            conversation["title"] = listing.title;
            conversation["price"] = listing.price;
            conversation["images"] = listing.images;
            // add additional information
            conversations[i] = conversation;
        }
        res.status(200).json(conversations);
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Unable to get conversations",
        });
    }
});
exports.getConversations = getConversations;
