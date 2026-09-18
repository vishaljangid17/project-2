const express = require("express");
const router = express.Router({
    mergeParams: true
});
const Listing = require("../models/listing.js");
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const { isLoggedIn } = require("../middleware.js");
const reviewController = require("../controllers/reviews.js");

// VALIDATE REVIEW

const validateReview = (req, res, next) => {

    const { error } = reviewSchema.validate(req.body);

    console.log("JOI RESULT:");

    if (error) {
        throw new ExpressError(
            400,
            error.details[0].message
        );
    }

    next();
};
// CREATE REVIEW ROUTE
// POST /listings/:id/reviews
router.post(
    "/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.createReview)
);
// DELETE REVIEW ROUTE
// DELETE /listings/:id/reviews/:reviewId
router.delete(
    "/:reviewId",
    isLoggedIn,
    wrapAsync(reviewController.destroyReview)
);
// EXPORT ROUTER
module.exports = router;