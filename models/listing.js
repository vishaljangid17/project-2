const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review.js");


// ==================================================
// DEFAULT IMAGE
// ==================================================

const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80";


// ==================================================
// LISTING SCHEMA
// ==================================================

const listingSchema = new Schema({

    // =========================
    // TITLE
    // =========================

    title: {
        type: String,
        required: true,
    },


    // =========================
    // DESCRIPTION
    // =========================

    description: String,


    // =========================
    // IMAGE
    // =========================

    image: {

        url: {
            type: String,
            default: DEFAULT_IMAGE,

            set: (v) => {

                if (v === "") {
                    return DEFAULT_IMAGE;
                }

                return v;
            },
        },

        filename: {
            type: String,
            default: "listingimage",
        },

    },


    // =========================
    // PRICE
    // =========================

    price: Number,


    // =========================
    // LOCATION
    // =========================

    location: String,


    // =========================
    // COUNTRY
    // =========================

    country: String,


    // =========================
    // GEOMETRY
    // =========================

    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true,
        },

        coordinates: {
            type: [Number],
            required: true,
        },
    },


    // =========================
    // REVIEWS
    // =========================

    reviews: [

        {
            type: Schema.Types.ObjectId,
            ref: "Review",
        }

    ],


    // =========================
    // OWNER
    // =========================

    owner: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },

});


// ==================================================
// DELETE REVIEWS WHEN LISTING IS DELETED
// ==================================================

listingSchema.post(
    "findOneAndDelete",

    async (listing) => {

        if (listing) {

            await Review.deleteMany({

                _id: {
                    $in: listing.reviews,
                },

            });

        }

    }
);


// ==================================================
// MODEL
// ==================================================

const Listing =
    mongoose.model(
        "Listing",
        listingSchema
    );


// ==================================================
// EXPORT
// ==================================================

module.exports = Listing;