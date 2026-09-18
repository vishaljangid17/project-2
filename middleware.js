const Listing = require("./models/listing");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema } = require("./schema.js");


// ==================================================
// IS LOGGED IN
// ==================================================

module.exports.isLoggedIn = (req, res, next) => {

    if (!req.isAuthenticated()) {

        req.session.redirectUrl = req.originalUrl;

        req.flash(
            "error",
            "You must be logged in!"
        );

        return res.redirect("/login");
    }

    next();
};


// ==================================================
// SAVE REDIRECT URL
// ==================================================

module.exports.saveRedirectUrl = (req, res, next) => {

    if (req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }

    next();
};


// ==================================================
// IS LISTING OWNER
// ==================================================

module.exports.isOwner = async (req, res, next) => {

    const { id } = req.params;

    const listing = await Listing.findById(id);

    if (!listing) {

        req.flash(
            "error",
            "Listing no longer exists!"
        );

        return res.redirect("/listings");
    }

    if (!listing.owner || !listing.owner.equals(req.user._id)) {

        req.flash(
            "error",
            "You don't have permission!"
        );

        return res.redirect(`/listings/${id}`);
    }

    next();
};


// ==================================================
// IS REVIEW AUTHOR
// ==================================================

module.exports.isReviewAuthor = async (req, res, next) => {

    const { id, reviewId } = req.params;

    const review = await Review.findById(reviewId);

    if (!review) {

        req.flash(
            "error",
            "Review no longer exists!"
        );

        return res.redirect(`/listings/${id}`);
    }

    if (!review.author || !review.author.equals(req.user._id)) {

        req.flash(
            "error",
            "You can delete only your own review!"
        );

        return res.redirect(`/listings/${id}`);
    }

    next();
};


// ==================================================
// VALIDATE LISTING
// ==================================================

module.exports.validateListing = (req, res, next) => {

    const { error } = listingSchema.validate(req.body);

    console.log("JOI RESULT:");

    if (error) {

        throw new ExpressError(
            400,
            error.details[0].message
        );
    }

    next();
};