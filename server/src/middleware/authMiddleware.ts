import { RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import pool from "../db";
import { PrivateRequest } from "../models/RequestModel";

interface TokenPayload extends JwtPayload {
  uid: string;
}

const protect: RequestHandler = async (req: PrivateRequest, res, next) => {
  const { authorisation } = req.headers;

  if (!authorisation) {
    return res.status(401).json({ error: "Authorisation token required" });
  }

  const token = (authorisation as string).split(" ")[1];

  try {
    const { uid } = jwt.verify(token, process.env.SECRET!) as TokenPayload;

    const q = "SELECT * FROM users WHERE uid = $1";
    const values = [uid];

    const result = await pool.query(q, values);
    const user = result.rows[0];

    if (!user) throw new Error("User does not exist");

    req.uid = user.uid;
    req.username = user.username;
    req.email = user.email;
    req.avatar = user.avatar;

    next();
  } catch (error) {
    return res.status(400).json({
      error:
        error instanceof Error ? error.message : "Unable to authorise user",
    });
  }
};

export { protect };
