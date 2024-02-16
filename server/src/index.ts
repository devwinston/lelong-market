import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import pg from "pg";
import dotenv from "dotenv";
dotenv.config();

import { app, server } from "./socket/socket";
import pool from "./db";
import userRoutes from "./routes/userRoutes";
import listingRoutes from "./routes/listingRoutes";
import messageRoutes from "./routes/messageRoutes";

// middleware
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(req.method, req.path);
  next();
});

// routes
app.use("/api/users", userRoutes);
app.use("/api/listings", listingRoutes);
app.use("/api/messages", messageRoutes);

// errors
app.use((req, res, next) => {
  next(new Error("Endpoint not found"));
});
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) res.status(500).json({ error: err.message });
  else res.status(500).json({ error: "An unknown error occurred" });
});

// listen
const port = process.env.PORT || 4000;

pool.connect((error) => {
  if (error) throw new Error("Unable to connect to PostgreSQL database");
  console.log("Connected to PostgreSQL database");

  server.listen(port, () => {
    console.log(`Server listening on port ${port}...`);
  });
});
