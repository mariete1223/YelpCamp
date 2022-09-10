const express = require("express");
//if we want the value of the params specified on the root path we set on the app.use
//we have to set this option to true
const router = express.Router({mergeParams: true});
const catchAsync = require("../utils/catchAsync.js");
const reviews = require("../controllers/reviews");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middlewares");

router.post("/", isLoggedIn, validateReview, catchAsync(reviews.uploadReview));

router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;