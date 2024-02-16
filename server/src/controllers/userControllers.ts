import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

import pool from "../db";
import { PrivateRequest } from "../models/RequestModel";
import { sendEmail } from "../utilities/sendEmail";

// @desc sign up user
// @route POST /api/users/signup
// @access public

interface SignupUserReqBody {
  username: string;
  email: string;
  password: string;
}

const signupUser = async (req: Request, res: Response) => {
  const { username, email, password }: SignupUserReqBody = req.body;

  try {
    // check empty username, email, or password

    if (!username || !email || !password)
      throw new Error("Empty username, email, or password");

    // check valid email

    const emailRegex = /^[A-Z0-9+_.-]+@[A-Z0-9.-]+$/i;
    if (!emailRegex.test(email)) throw new Error("Invalid email");

    // check existing email

    const q1 = "SELECT * FROM users WHERE email = $1";
    const v1 = [email];

    const result = await pool.query(q1, v1);
    const emails = result.rows;
    if (emails.length !== 0) throw new Error("Email already exists");

    // sign up user

    const uid = uuidv4();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const avatar =
      "https://firebasestorage.googleapis.com/v0/b/lelong-market.appspot.com/o/avatar.png?alt=media&token=a1c22e1a-1e37-4454-993c-9e8b045ccf5f";

    const q2 =
      "INSERT INTO users (uid, username, email, password, avatar) VALUES ($1, $2, $3, $4, $5)";
    const v2 = [uid, username, email, hash, avatar];

    await pool.query(q2, v2);
    const token = jwt.sign({ uid }, process.env.SECRET!, { expiresIn: "3d" });

    res.status(200).json({ uid, username, token });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to sign up user",
    });
  }
};

// @desc sign in user
// @route POST /api/users/signin
// @access public

interface SigninUserReqBody {
  email: string;
  password: string;
}

const signinUser = async (req: Request, res: Response) => {
  const { email, password }: SigninUserReqBody = req.body;

  try {
    // check empty email or password

    if (!email || !password) throw new Error("Empty email or password");

    // check valid email

    const q = "SELECT * FROM users WHERE email = $1";
    const v = [email];

    const result = await pool.query(q, v);
    const user = result.rows[0];
    if (!user) throw new Error("Invalid credentials");

    // check valid password

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new Error("Invalid credentials");

    // sign in user

    const username = user.username;
    const uid = user.uid;
    const token = jwt.sign({ uid }, process.env.SECRET!, { expiresIn: "3d" });

    res.status(200).json({ uid, username, token });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to sign in user",
    });
  }
};

// @desc get user
// @route GET /api/users/:uid
// @access private 1

const getUser = async (req: PrivateRequest, res: Response) => {
  const { uid } = req.params;

  try {
    const q = "SELECT * FROM users WHERE uid = $1";
    const v = [uid];

    const result = await pool.query(q, v);
    const user = result.rows[0];

    if (!user) throw new Error("User does not exist");

    res.status(200).json({
      uid: user.uid,
      username: user.username,
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to get user",
    });
  }
};

// @desc update user
// @route PATCH /api/users/:uid
// @access private 2

interface UpdateUserReqBody {
  password: string;
  avatar: string;
}

const updateUser = async (req: PrivateRequest, res: Response) => {
  const { uid: routeUid } = req.params;
  const { password, avatar }: UpdateUserReqBody = req.body;
  const uid = req.uid;

  try {
    const q1 = "SELECT * FROM users WHERE uid = $1";
    const v1 = [routeUid];

    let result = await pool.query(q1, v1);
    let user = result.rows[0];

    if (!user) throw new Error("User does not exist");

    if (user.uid !== uid) throw new Error("Update not authorised");

    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hash = await bcrypt.hash(password, salt);

      const q2 = "UPDATE users SET password = $1 WHERE uid = $2 RETURNING *";
      const v2 = [hash, uid];

      result = await pool.query(q2, v2);
      user = result.rows[0];

      res.status(200).json({
        uid: user.uid,
        username: user.username,
        avatar: user.avatar,
      });
    }

    if (avatar) {
      // update listing avatar
      const q2 = "UPDATE listings SET avatar = $1 WHERE uid = $2";
      const v2 = [avatar, uid];

      await pool.query(q2, v2);

      // update user avatar
      const q3 = "UPDATE users SET avatar = $1 WHERE uid = $2 RETURNING *";
      const v3 = [avatar, uid];

      result = await pool.query(q3, v3);
      user = result.rows[0];

      res.status(200).json({
        uid: user.uid,
        username: user.username,
        avatar: user.avatar,
      });
    }
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to update user",
    });
  }
};

// @desc reset user
// @route POST /api/users/reset
// @access public

interface resetUserReqBody {
  email: string;
}

const resetUser = async (req: Request, res: Response) => {
  const { email }: resetUserReqBody = req.body;

  try {
    const q1 = "SELECT * FROM users WHERE email = $1";
    const v1 = [email];

    let result = await pool.query(q1, v1);
    let user = result.rows[0];

    if (!user) throw new Error("User does not exist");

    const resetPassword = uuidv4();
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(resetPassword, salt);

    const status = await sendEmail(email, resetPassword);
    if (status === "error") throw new Error("Unable to send email");

    const q2 = "UPDATE users SET password = $1 WHERE email = $2 RETURNING *";
    const v2 = [hash, email];

    result = await pool.query(q2, v2);
    user = result.rows[0];

    res.status(200).json({
      uid: user.uid,
      username: user.username,
      avatar: user.avatar,
    });
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to reset user",
    });
  }
};

export { signupUser, signinUser, getUser, updateUser, resetUser };
