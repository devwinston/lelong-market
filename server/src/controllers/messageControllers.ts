import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";

import pool from "../db";
import { PrivateRequest } from "../models/RequestModel";
import { getSocket, io } from "../socket/socket";

// @desc send message
// @route POST /api/messages/:pid/:uid
// @access private

interface SendMessageReqBody {
  text: string;
}

const sendMessage = async (req: PrivateRequest, res: Response) => {
  const { pid, uid: receiverUid } = req.params;
  const { text }: SendMessageReqBody = req.body;
  const senderUid = req.uid;

  try {
    // check if product exists

    const q1 = "SELECT * FROM listings WHERE pid = $1";
    const v1 = [pid];

    let result = await pool.query(q1, v1);
    const listing = result.rows[0];

    if (!listing) throw new Error("Listing no longer available");

    // check if conversation exists

    const q2 =
      "SELECT * FROM conversations WHERE uids @> ARRAY[$1, $2] AND pid = $3";
    const v2 = [senderUid, receiverUid, pid];

    result = await pool.query(q2, v2);
    const conversation = result.rows[0];

    if (!conversation) {
      // conversation does not exist

      // create message

      const mid = uuidv4();

      const q3 =
        "INSERT INTO messages (mid, sender, receiver, text, created) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *";
      const v3 = [mid, senderUid, receiverUid, text];

      const result = await pool.query(q3, v3);
      const message = result.rows[0];

      // create conversation

      const cid = uuidv4();

      const q4 =
        "INSERT INTO conversations (cid, pid, uids, messages, updated) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)";
      const v4 = [cid, pid, [senderUid, receiverUid], [mid]];

      await pool.query(q4, v4);

      // socket.io

      const receiverSocket = getSocket(receiverUid);
      if (receiverSocket) {
        // io.to(<socketId>) sends events to specific client
        io.to(receiverSocket).emit("message", { pid, message });
      }

      res.status(200).json(message);
    } else {
      // conversation exists

      // create message

      const mid = uuidv4();

      const q3 =
        "INSERT INTO messages (mid, sender, receiver, text, created) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP) RETURNING *";
      const v3 = [mid, senderUid, receiverUid, text];

      const result = await pool.query(q3, v3);
      const message = result.rows[0];

      // add message to conversation

      const cid = conversation.cid;
      const messages = conversation.messages;
      messages.push(mid);

      const q4 =
        "UPDATE conversations SET (messages, updated) = ($1, CURRENT_TIMESTAMP) WHERE cid = $2";
      const v4 = [messages, cid];

      await pool.query(q4, v4);

      // socket.io

      const receiverSocket = getSocket(receiverUid);
      if (receiverSocket) {
        // io.to(<socketId>) sends events to specific client
        io.to(receiverSocket).emit("message", { pid, message });
      }

      res.status(200).json(message);
    }
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to send message",
    });
  }
};

// @desc get messages
// @route GET /api/messages/:pid/:uid
// @access private

const getMessages = async (req: PrivateRequest, res: Response) => {
  const { pid, uid: receiverUid } = req.params;
  const senderUid = req.uid;

  try {
    const q1 =
      "SELECT messages FROM conversations WHERE uids @> ARRAY[$1, $2] AND pid = $3";
    const v1 = [senderUid, receiverUid, pid];

    const result = await pool.query(q1, v1);
    const conversation = result.rows[0];

    if (conversation) {
      const mids = conversation.messages;

      const q2 = "SELECT * FROM messages WHERE mid = ANY($1)";
      const v2 = [mids];

      const result = await pool.query(q2, v2);
      const messages = result.rows;

      res.status(200).json(messages);
    } else {
      res.status(200).json([]);
    }
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to get messages",
    });
  }
};

// @desc get conversations
// @route GET /api/messages
// @access private

const getConversations = async (req: PrivateRequest, res: Response) => {
  const senderUid = req.uid;

  try {
    const q =
      "SELECT * FROM conversations WHERE $1 = ANY(uids) ORDER BY updated DESC";
    const v = [senderUid];

    const result = await pool.query(q, v);
    const conversations = result.rows;

    // get additional information

    for (let i = 0; i < conversations.length; i++) {
      const conversation = conversations[i];

      // get receiver information

      const [receiverUid] = conversation.uids.filter(
        (uid: string) => uid !== senderUid
      );

      let q = "SELECT username, avatar FROM users WHERE uid = $1";
      let v = [receiverUid];

      let result = await pool.query(q, v);
      const receiver = result.rows[0];

      conversation["uid"] = receiverUid;
      conversation["username"] = receiver.username;
      conversation["avatar"] = receiver.avatar;

      // get listing information

      const pid = conversation.pid;

      q = "SELECT title, price, images FROM listings WHERE pid = $1";
      v = [pid];

      result = await pool.query(q, v);
      const listing = result.rows[0];

      conversation["title"] = listing.title;
      conversation["price"] = listing.price;
      conversation["images"] = listing.images;

      // add additional information

      conversations[i] = conversation;
    }

    res.status(200).json(conversations);
  } catch (error) {
    res.status(400).json({
      error:
        error instanceof Error ? error.message : "Unable to get conversations",
    });
  }
};

export { sendMessage, getMessages, getConversations };
