import express from "express";

import {
  addListing,
  getListings,
  getUserListings,
  getListing,
  deleteListing,
  updateListing,
  offerListing,
} from "../controllers/listingControllers";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.route("/").post(protect, addListing).get(getListings);
router.route("/:uid").get(protect, getUserListings);
router
  .route("/:pid")
  .get(protect, getListing)
  .delete(protect, deleteListing)
  .patch(protect, updateListing);
router.route("/:pid/offer").patch(protect, offerListing);
// router.route("/:p") // @TODO pagination

export default router;
