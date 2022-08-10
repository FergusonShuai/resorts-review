const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const reviews = require("../controllers/controller_reviews");
const {
  isLoggedIn,
  isAuthor,
  isReviewAuthor,
  validateReview,
} = require("../middleware");

router.post(
  "/:id/reviews",
  isLoggedIn,
  validateReview,
  wrapAsync(reviews.postReview)
);

router.delete(
  "/:id/reviews/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviews.deleteReview)
);

module.exports = router;
