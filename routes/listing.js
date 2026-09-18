const express = require("express");
const router = express.Router();

const wrapAsync = require("../utils/wrapAsync.js");

const {
    isLoggedIn,
    isOwner,
    validateListing
} = require("../middleware.js");

const listingController =
    require("../controllers/listings.js");


// ==================================================
// MULTER + CLOUDINARY
// ==================================================

const multer = require("multer");

const { storage } =
    require("../cloudConfig.js");

const upload = multer({
    storage
});


// ==================================================
// LISTING INDEX + CREATE
// ==================================================

router
    .route("/")

    // GET /listings
    .get(
        wrapAsync(
            listingController.index
        )
    )

    // POST /listings
    .post(
        isLoggedIn,

        upload.single(
            "listing[image][url]"
        ),

        validateListing,

        wrapAsync(
            listingController.createListing
        )
    );


// ==================================================
// NEW LISTING
// ==================================================

router.get(
    "/new",
    isLoggedIn,

    listingController.renderNewForm
);


// ==================================================
// SHOW / UPDATE / DELETE
// ==================================================

router
    .route("/:id")

    // GET /listings/:id
    .get(
        wrapAsync(
            listingController.showListing
        )
    )

    // PUT /listings/:id
    .put(
        isLoggedIn,

        isOwner,

        // IMPORTANT:
        // Multer must run before validateListing
        upload.single(
            "listing[image][url]"
        ),

        validateListing,

        wrapAsync(
            listingController.updateListing
        )
    )

    // DELETE /listings/:id
    .delete(
        isLoggedIn,

        isOwner,

        wrapAsync(
            listingController.destroyListing
        )
    );


// ==================================================
// EDIT
// ==================================================

router.get(
    "/:id/edit",

    isLoggedIn,

    isOwner,

    wrapAsync(
        listingController.renderEditForm
    )
);


// ==================================================
// EXPORT
// ==================================================

module.exports = router;