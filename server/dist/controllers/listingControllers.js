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
exports.offerListing = exports.updateListing = exports.deleteListing = exports.getListing = exports.getUserListings = exports.getListings = exports.addListing = void 0;
const db_1 = __importDefault(require("../db"));
const addListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pid, title, description, price, category, images, } = req.body;
    const uid = req.uid;
    const username = req.username;
    const avatar = req.avatar;
    try {
        if (!title || !description || !price || !category || !images)
            throw new Error("Empty input field(s)");
        const offers = [];
        const sold = false;
        const q = "INSERT INTO listings (pid, uid, username, avatar, title, description, price, category, images, offers, sold, created, updated) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP) RETURNING *";
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
        const result = yield db_1.default.query(q, v);
        const listing = result.rows[0];
        res.status(200).json(listing);
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Unable to add listing",
        });
    }
});
exports.addListing = addListing;
// @desc get listings
// @route GET /api/listings
// @access public
const getListings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // e.g. /?filters=price,category
    // const filters = req.query.filters; // @TODO filters
    // console.log(filters);
    try {
        const q = "SELECT * FROM listings ORDER BY updated DESC LIMIT 20";
        const result = yield db_1.default.query(q);
        const listings = result.rows;
        res.status(200).json(listings);
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Unable to get listings",
        });
    }
});
exports.getListings = getListings;
// @desc get user listings
// @route GET /api/listings/:uid
// @access private 1
const getUserListings = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { uid } = req.params;
    try {
        const q = "SELECT * FROM listings WHERE uid = $1 ORDER BY updated DESC";
        const v = [uid];
        const result = yield db_1.default.query(q, v);
        const listings = result.rows;
        res.status(200).json(listings);
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Unable to get listings",
        });
    }
});
exports.getUserListings = getUserListings;
// @desc get listing
// @route GET /api/listings/:pid
// @access private 1
const getListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pid } = req.params;
    try {
        const q = "SELECT * FROM listings WHERE pid = $1";
        const v = [pid];
        const result = yield db_1.default.query(q, v);
        const listing = result.rows[0];
        if (!listing)
            throw new Error("Listing does not exist");
        res.status(200).json(listing);
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Unable to get listing",
        });
    }
});
exports.getListing = getListing;
// @desc delete listing
// @route DELETE /api/listings/:pid
// @access private 2
const deleteListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pid } = req.params;
    const uid = req.uid;
    try {
        const q1 = "SELECT * FROM listings where pid = $1";
        const v1 = [pid];
        let result = yield db_1.default.query(q1, v1);
        let listing = result.rows[0];
        if (!listing)
            throw new Error("Listing does not exist");
        if (listing.uid !== uid)
            throw new Error("Deletion not authorised");
        const q2 = "DELETE FROM listings WHERE pid = $1 RETURNING *";
        const v2 = [pid];
        result = yield db_1.default.query(q2, v2);
        listing = result.rows[0];
        // delete messages
        const q3 = "DELETE FROM messages WHERE mid = ANY(SELECT UNNEST(messages) AS mid FROM conversations WHERE pid = $1)";
        const v3 = [pid];
        yield db_1.default.query(q3, v3);
        // delete conversations
        const q4 = "DELETE FROM conversations WHERE pid = $1";
        const v4 = [pid];
        yield db_1.default.query(q4, v4);
        res.status(200).json(listing);
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Unable to delete listing",
        });
    }
});
exports.deleteListing = deleteListing;
const updateListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pid } = req.params;
    const { title, description, price, category, images, offers, sold, } = req.body;
    const uid = req.uid;
    try {
        const q1 = "SELECT * FROM listings where pid = $1";
        const v1 = [pid];
        let result = yield db_1.default.query(q1, v1);
        let listing = result.rows[0];
        if (!listing)
            throw new Error("Listing does not exist");
        if (listing.uid !== uid)
            throw new Error("Update not authorised");
        const q2 = "UPDATE listings SET (title, description, price, category, images, offers, sold, updated) = ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP) WHERE pid = $8 RETURNING *";
        const v2 = [title, description, price, category, images, offers, sold, pid];
        result = yield db_1.default.query(q2, v2);
        listing = result.rows[0];
        res.status(200).json(listing);
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Unable to update listing",
        });
    }
});
exports.updateListing = updateListing;
const offerListing = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { pid } = req.params;
    const { offer } = req.body;
    const uid = req.uid;
    const username = req.username;
    try {
        const q1 = "SELECT * FROM listings where pid = $1";
        const v1 = [pid];
        let result = yield db_1.default.query(q1, v1);
        let listing = result.rows[0];
        if (!listing)
            throw new Error("Listing does not exist");
        if (listing.uid === uid)
            throw new Error("Offer not authorised");
        let offers = listing.offers;
        // check if user already made an offer
        const index = offers.findIndex((offer) => offer.includes(uid));
        if (index === -1)
            offers.push(`${uid}/${username}/${offer}`);
        else
            offers[index] = `${uid}/${username}/${offer}`;
        const q2 = "UPDATE listings SET offers = $1 WHERE pid = $2 RETURNING *";
        const v2 = [offers, pid];
        result = yield db_1.default.query(q2, v2);
        listing = result.rows[0];
        res.status(200).json(listing);
    }
    catch (error) {
        res.status(400).json({
            error: error instanceof Error ? error.message : "Unable to offer listing",
        });
    }
});
exports.offerListing = offerListing;
