import path from "path";
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();

import { app, server } from "./socket/socket";
import pool from "./db";
import userRoutes from "./routes/userRoutes";
import listingRoutes from "./routes/listingRoutes";
import messageRoutes from "./routes/messageRoutes";

// variables
const port = process.env.PORT || 4000;
const __path = path.resolve();
// const mode = "production";
const mode = "deployment";

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

// static files (for deployment)
if (mode === "deployment") {
  app.use(express.static(path.join(__path, "/client/build")));
  app.get("*", (req, res) =>
    res.sendFile(path.resolve(__path, "client", "build", "index.html"))
  );
}

// errors
app.use((req, res, next) => {
  next(new Error("Endpoint not found"));
});
app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof Error) res.status(500).json({ error: err.message });
  else res.status(500).json({ error: "An unknown error occurred" });
});

// listen
pool.connect((error) => {
  if (error) throw new Error("Unable to connect to PostgreSQL database");
  console.log("Connected to PostgreSQL database");

  server.listen(port, () => {
    console.log(`Server listening on port ${port}...`);
  });
});
