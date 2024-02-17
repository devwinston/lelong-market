import { Request, Response } from "express";

import pool from "../db";
import { PrivateRequest } from "../models/RequestModel";

// @desc add listing
// @route POST /api/listings
// @access private 1

interface AddListingReqBody {
  pid: string;
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
}

const addListing = async (req: PrivateRequest, res: Response) => {
  const {
    pid,
    title,
    description,
    price,
    category,
    images,
  }: AddListingReqBody = req.body;
  const uid = req.uid;
  const username = req.username;
  const avatar = req.avatar;

  try {
    if (!title || !description || !price || !category || !images)
      throw new Error("Empty input field(s)");

    const offers: string[] = [];
    const sold = false;

    const q =
      "INSERT INTO listings (pid, uid, username, avatar, title, description, price, category, images, offers, sold, created, updated) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *";
    const v = [
      pid,
      uid,
      username,
      avatar,
      title,
      description,
      price,
      category,
      images,
      offers,
      sold,
    ];

    const result = await pool.query(q, v);
    const listing = result.rows[0];

    res.status(200).json(listing);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to add listing",
    });
  }
};

// @desc get listings
// @route GET /api/listings?<query>=<value>&
// @access public

const getListings = async (req: Request, res: Response) => {
  const search = req.query.search;
  const price = req.query.price;
  const category = req.query.category;
  const sold = req.query.sold;

  const page = req.query.page;
  const pages = req.query.pages;
  const size = req.query.size;

  try {
    let q = `
    SELECT *
    FROM listings`;

    let v = [];

    // search

    if (search) {
      const keywords = (search as string)
        .split(/[ ,]+/)
        .map((keyword) => keyword.trim());
      const placeholders = keywords
        .map((_, index) => `$${index + 1}`)
        .join(", ");
      const matches = keywords.map((keyword) => `%${keyword}%`);

      q += `
      WHERE (username ILIKE ANY(ARRAY[${placeholders}])
      OR title ILIKE ANY(ARRAY[${placeholders}]))`;

      v.push(...matches);
    }

    // filter

    if (category) {
      if (v.length > 0)
        q += `
      AND category = $${v.length + 1}`;
      else
        q += `
      WHERE category = $1`;

      v.push(category);
    }

    if (sold) {
      const soldValue = sold === "True" ? "TRUE" : "FALSE";

      if (v.length > 0)
        q += `
      AND sold = $${v.length + 1}`;
      else
        q += `
      WHERE sold = $1`;

      v.push(soldValue);
    }

    // sort

    if (price) {
      const priceValue = price === "High" ? "DESC" : "ASC";

      q += `
      ORDER BY price ${priceValue}, updated DESC`;
    } else {
      q += `
      ORDER BY updated DESC`;
    }

    q += `
    OFFSET (($${v.length + 1} - 1) * $${v.length + 3})
    LIMIT ($${v.length + 2} * $${v.length + 3})`;

    v.push(page, pages, size);

    console.log("q: ", q);
    console.log("v: ", v);

    const result = await pool.query(q, v);
    const listings = result.rows;

    res.status(200).json(listings);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to get listings",
    });
  }
};

// @desc get user listings
// @route GET /api/listings/:uid
// @access private 1

const getUserListings = async (req: PrivateRequest, res: Response) => {
  const { uid } = req.params;

  try {
    const q = "SELECT * FROM listings WHERE uid = $1 ORDER BY updated DESC";
    const v = [uid];

    const result = await pool.query(q, v);
    const listings = result.rows;

    res.status(200).json(listings);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to get listings",
    });
  }
};

// @desc get listing
// @route GET /api/listings/:pid
// @access private 1

const getListing = async (req: Request, res: Response) => {
  const { pid } = req.params;

  try {
    const q = "SELECT * FROM listings WHERE pid = $1";
    const v = [pid];

    const result = await pool.query(q, v);
    const listing = result.rows[0];

    if (!listing) throw new Error("Listing does not exist");

    res.status(200).json(listing);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to get listing",
    });
  }
};

// @desc delete listing
// @route DELETE /api/listings/:pid
// @access private 2

const deleteListing = async (req: PrivateRequest, res: Response) => {
  const { pid } = req.params;
  const uid = req.uid;

  try {
    const q1 = "SELECT * FROM listings where pid = $1";
    const v1 = [pid];

    let result = await pool.query(q1, v1);
    let listing = result.rows[0];

    if (!listing) throw new Error("Listing does not exist");

    if (listing.uid !== uid) throw new Error("Deletion not authorised");

    const q2 = "DELETE FROM listings WHERE pid = $1 RETURNING *";
    const v2 = [pid];

    result = await pool.query(q2, v2);
    listing = result.rows[0];

    // delete messages

    const q3 =
      "DELETE FROM messages WHERE mid = ANY(SELECT UNNEST(messages) AS mid FROM conversations WHERE pid = $1)";
    const v3 = [pid];

    await pool.query(q3, v3);

    // delete conversations

    const q4 = "DELETE FROM conversations WHERE pid = $1";
    const v4 = [pid];

    await pool.query(q4, v4);

    res.status(200).json(listing);
  } catch (error) {
    res.status(400).json({
      error:
        error instanceof Error ? error.message : "Unable to delete listing",
    });
  }
};

// @desc update listing
// @route PATCH /api/listings/:pid
// @access private 2

interface UpdateListingReqBody {
  title: string;
  description: string;
  price: number;
  category: string;
  images: string[];
  offers: string[];
  sold: boolean;
}

const updateListing = async (req: PrivateRequest, res: Response) => {
  const { pid } = req.params;
  const {
    title,
    description,
    price,
    category,
    images,
    offers,
    sold,
  }: UpdateListingReqBody = req.body;
  const uid = req.uid;

  try {
    const q1 = "SELECT * FROM listings where pid = $1";
    const v1 = [pid];

    let result = await pool.query(q1, v1);
    let listing = result.rows[0];

    if (!listing) throw new Error("Listing does not exist");

    if (listing.uid !== uid) throw new Error("Update not authorised");

    const q2 =
      "UPDATE listings SET (title, description, price, category, images, offers, sold, updated) = ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) WHERE pid = $8 RETURNING *";
    const v2 = [title, description, price, category, images, offers, sold, pid];

    result = await pool.query(q2, v2);
    listing = result.rows[0];

    res.status(200).json(listing);
  } catch (error) {
    res.status(400).json({
      error:
        error instanceof Error ? error.message : "Unable to update listing",
    });
  }
};

// @desc offer listing
// @route PATCH /api/listings/:pid/offer
// @access private 1

interface OfferListingReqBody {
  offer: number;
}

const offerListing = async (req: PrivateRequest, res: Response) => {
  const { pid } = req.params;
  const { offer }: OfferListingReqBody = req.body;
  const uid = req.uid;
  const username = req.username;

  try {
    const q1 = "SELECT * FROM listings where pid = $1";
    const v1 = [pid];

    let result = await pool.query(q1, v1);
    let listing = result.rows[0];

    if (!listing) throw new Error("Listing does not exist");

    if (listing.uid === uid) throw new Error("Offer not authorised");

    let offers = listing.offers;

    // check if user already made an offer
    const index = offers.findIndex((offer: string) => offer.includes(uid!));
    if (index === -1) offers.push(`${uid}/${username}/${offer}`);
    else offers[index] = `${uid}/${username}/${offer}`;

    const q2 = "UPDATE listings SET offers = $1 WHERE pid = $2 RETURNING *";
    const v2 = [offers, pid];

    result = await pool.query(q2, v2);
    listing = result.rows[0];

    res.status(200).json(listing);
  } catch (error) {
    res.status(400).json({
      error: error instanceof Error ? error.message : "Unable to offer listing",
    });
  }
};

export {
  addListing,
  getListings,
  getUserListings,
  getListing,
  deleteListing,
  updateListing,
  offerListing,
};
