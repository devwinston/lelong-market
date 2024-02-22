"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const listingControllers_1 = require("../controllers/listingControllers");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.route("/").post(authMiddleware_1.protect, listingControllers_1.addListing).get(listingControllers_1.getListings);
router.route("/:uid").get(authMiddleware_1.protect, listingControllers_1.getUserListings);
router
    .route("/:pid")
    .get(authMiddleware_1.protect, listingControllers_1.getListing)
    .delete(authMiddleware_1.protect, listingControllers_1.deleteListing)
    .patch(authMiddleware_1.protect, listingControllers_1.updateListing);
router.route("/:pid/offer").patch(authMiddleware_1.protect, listingControllers_1.offerListing);
exports.default = router;
