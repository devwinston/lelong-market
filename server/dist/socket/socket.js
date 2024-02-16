"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = exports.getSocket = void 0;
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: ["http://localhost:3000"],
        methods: ["GET", "POST"],
    },
});
exports.io = io;
const getSocket = (uid) => {
    return socketMap[uid];
};
exports.getSocket = getSocket;
const socketMap = {};
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);
    const uid = socket.handshake.query.uid;
    if (uid)
        socketMap[uid] = socket.id;
    // io.emit() sends events to all connected clients
    io.emit("getOnline", Object.keys(socketMap));
    // socket.on() listens to events on server AND client
    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
        if (Object.values(socketMap).includes(socket.id)) {
            delete socketMap[uid];
        }
        io.emit("getOnline", Object.keys(socketMap));
    });
});
