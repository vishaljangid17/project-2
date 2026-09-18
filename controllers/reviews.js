const Listing = require("../models/listing");
const Review = require("../models/review");


module.exports.createReview = async (req, res) => {
        console.log("🔥 REVIEW ROUTE HIT");
        const { id } = req.params;
        console.log("LISTING ID:", id);
        console.log("REVIEW DATA:", req.body);
        // Find listing
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing no longer exists!");
            return res.redirect("/listings");
        }
        // Create new review
        const newReview = new Review(
            req.body.review
        );
        // Set review author
        newReview.author = req.user._id;
        // Add review ID to listing
        listing.reviews.push(
            newReview._id
        );
        // Save review
        await newReview.save();
        // Save listing
        await listing.save();
        console.log("✅ REVIEW SAVED");
        // Success message
        req.flash("success","Review Added Successfully!");
        // Redirect
        res.redirect(`/listings/${listing._id}`);
    }

module.exports.destroyReview =async (req, res) => {

        const {
            id,
            reviewId
        } = req.params;
        // Find listing
        const listing = await Listing.findById(id);

        if (!listing) {

            req.flash("error","Listing no longer exists!");
            return res.redirect("/listings");
        }
        // Find review
        const review = await Review.findById(reviewId);
        if (!review) {
            req.flash("error",   "Review no longer exists!");
            return res.redirect(`/listings/${id}` );
        }
        // Remove review from listing
        await Listing.findByIdAndUpdate(
            id,
            {
                $pull: {
                    reviews: reviewId
                }
            }
        );
        // Delete review
        await Review.findByIdAndDelete(
            reviewId
        );
        console.log("✅ Review deleted");
        // Success message
        req.flash( "success","Review Deleted Successfully!");
         // Redirect
        res.redirect(  `/listings/${id}`);
    }