import { Response } from "express";

import pool from "../db";
import { PrivateRequest } from "../models/RequestModel";

// @desc get user notifications
// @route GET /api/notifications/:uid
// @access private 2

const getUserNotifications = async (req: PrivateRequest, res: Response) => {
  const { uid: receiverUid } = req.params;
  // const requestorUid = req.uid;

  try {
    // if (requestorUid !== receiverUid)
    //   throw new Error("Notifications not authorised");

    const q =
      "SELECT * FROM notifications WHERE receiverUid = $1 ORDER BY created DESC";
    const v = [receiverUid];

    const result = await pool.query(q, v);
    const notifications = result.rows;

    res.status(200).json(notifications);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to get listings",
    });
  }
};

// @desc read user notifications
// @route PATCH /api/notifications/:uid
// @access private 2

const readUserNotifications = async (req: PrivateRequest, res: Response) => {
  const { uid: receiverUid } = req.params;
  // const requestorUid = req.uid;

  try {
    // if (requestorUid !== receiverUid)
    //   throw new Error("Notifications not authorised");

    const q =
      "UPDATE notifications SET unread = FALSE WHERE receiverUid = $1 RETURNING *";
    const v = [receiverUid];

    const result = await pool.query(q, v);
    const notifications = result.rows;

    res.status(200).json(notifications);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to get listings",
    });
  }
};

export { getUserNotifications, readUserNotifications };
