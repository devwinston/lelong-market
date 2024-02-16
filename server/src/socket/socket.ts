import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

export const getSocket = (uid: string): string => {
  return socketMap[uid];
};

const socketMap: {
  [key: string]: string;
} = {};

io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  const uid = socket.handshake.query.uid;
  if (uid) socketMap[uid as string] = socket.id;

  // io.emit() sends events to all connected clients
  io.emit("getOnline", Object.keys(socketMap));

  // socket.on() listens to events on server AND client
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);

    if (Object.values(socketMap).includes(socket.id)) {
      delete socketMap[uid as string];
    }

    io.emit("getOnline", Object.keys(socketMap));
  });
});

export { app, server, io };
