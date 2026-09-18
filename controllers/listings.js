const Listing = require("../models/listing");

// Geocoding
const geocodeCache = new Map();

let lastGeocodeRequestTime = 0;

// Wait before next geocoding request
const waitForNominatim = async () => {

    const now = Date.now();

    const timeSinceLastRequest =
        now - lastGeocodeRequestTime;

    const minimumDelay = 1100;

    if (
        timeSinceLastRequest <
        minimumDelay
    ) {

        const waitTime =
            minimumDelay -
            timeSinceLastRequest;

        await new Promise(
            (resolve) => {
                setTimeout(
                    resolve,
                    waitTime
                );
            }
        );
    }

    lastGeocodeRequestTime =
        Date.now();
};

// Geocoding helper
const geocodeLocation = async (
    location,
    country
) => {

    // Validate location
    if (
        !location ||
        !country
    ) {

        throw new Error(
            "Location and country are required."
        );
    }

    // Search text
    const searchText =
        `${location}, ${country}`;

    const cacheKey =
        searchText
            .trim()
            .toLowerCase();

    // Check cache
    if (
        geocodeCache.has(cacheKey)
    ) {

        const cachedCoordinates =
            geocodeCache.get(cacheKey);

        console.log(
            "📦 Using cached coordinates:",
            searchText,
            cachedCoordinates
        );

        return cachedCoordinates;
    }

    // Wait for Nominatim
    await waitForNominatim();

    // Create Nominatim URL
    const url =
        new URL(
            "https://nominatim.openstreetmap.org/search"
        );

    url.searchParams.set(
        "q",
        searchText
    );

    url.searchParams.set(
        "format",
        "jsonv2"
    );

    url.searchParams.set(
        "limit",
        "1"
    );

    // Request
    let response;

    try {

        response =
            await fetch(
                url,
                {
                    headers: {
                        "User-Agent":
                            "Wanderlust-MajorProject/1.0 (student web application)"
                    }
                }
            );

    } catch (error) {

        console.error(
            "❌ Nominatim request failed:",
            error
        );

        throw new Error(
            "Unable to connect to the geocoding service."
        );
    }

    // Check response
    if (!response.ok) {

        const errorText =
            await response.text();

        console.error(
            "❌ Nominatim Geocoding Error:",
            response.status,
            errorText
        );

        throw new Error(
            "Unable to geocode the listing location."
        );
    }

    // Parse response
    const data =
        await response.json();

    // No result
    if (
        !Array.isArray(data) ||
        data.length === 0
    ) {

        throw new Error(
            `Location "${searchText}" could not be found.`
        );
    }

    // Get coordinates
    const latitude =
        Number(
            data[0].lat
        );

    const longitude =
        Number(
            data[0].lon
        );

    // Validate coordinates
    if (
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
    ) {

        console.error(
            "❌ Invalid coordinates returned:",
            data[0]
        );

        throw new Error(
            "Invalid coordinates received from geocoding service."
        );
    }

    // MongoDB / Mapbox uses [longitude, latitude]
    const coordinates = [
        longitude,
        latitude
    ];

    // Save in cache
    geocodeCache.set(
        cacheKey,
        coordinates
    );

    console.log(
        "📍 Geocoded:",
        searchText,
        coordinates
    );

    return coordinates;
};

// Index
module.exports.index = async (
    req,
    res
) => {

    const allListings =
        await Listing.find({})
            .sort({
                _id: -1
            });

    res.render(
        "listings/index.ejs",
        {
            allListings
        }
    );
};

// New form
module.exports.renderNewForm = (
    req,
    res
) => {

    res.render(
        "listings/new.ejs"
    );
};

// Show listing
module.exports.showListing = async (
    req,
    res
) => {

    const {
        id
    } = req.params;

    const listing =
        await Listing.findById(id)
            .populate("owner")
            .populate({
                path: "reviews",
                populate: {
                    path: "author"
                }
            });

    // Listing not found
    if (!listing) {

        req.flash(
            "error",
            "Listing no longer exists!"
        );

        return res.redirect(
            "/listings"
        );
    }

    console.log(
        "📍 Listing geometry:",
        listing.geometry
    );

    res.render(
        "listings/show.ejs",
        {
            listing
        }
    );
};

// Create listing
module.exports.createListing = async (
    req,
    res
) => {

    console.log(
        "FORM DATA:",
        req.body
    );

    console.log(
        "UPLOADED FILE:",
        req.file
    );

    // Create listing
    const newListing =
        new Listing(
            req.body.listing
        );

    // Set owner
    newListing.owner =
        req.user._id;

    // Save Cloudinary image
    if (req.file) {

        newListing.image = {

            filename:
                req.file.filename,

            url:
                req.file.path

        };
    }

    // Geocoding
    const coordinates =
        await geocodeLocation(
            newListing.location,
            newListing.country
        );

    // Save geometry
    newListing.geometry = {

        type: "Point",

        coordinates:
            coordinates

    };

    // Save listing
    await newListing.save();

    console.log(
        "✅ Listing saved successfully!"
    );

    // Flash
    req.flash(
        "success",
        "New Listing Created!"
    );

    // Redirect
    res.redirect(
        "/listings"
    );
};

// Edit form
module.exports.renderEditForm =
    async (
        req,
        res
    ) => {

        const {
            id
        } = req.params;

        const listing =
            await Listing.findById(id);

        // Listing not found
        if (!listing) {

            req.flash(
                "error",
                "Listing no longer exists!"
            );

            return res.redirect(
                "/listings"
            );
        }

        res.render(
            "listings/edit.ejs",
            {
                listing
            }
        );
    };

// Update listing
module.exports.updateListing =
    async (
        req,
        res
    ) => {

        const {
            id
        } = req.params;

        console.log(
            "UPDATE FORM DATA:",
            req.body
        );

        console.log(
            "UPDATE FILE:",
            req.file
        );

        // Find listing
        const listing =
            await Listing.findById(id);

        // Listing not found
        if (!listing) {

            req.flash(
                "error",
                "Listing no longer exists!"
            );

            return res.redirect(
                "/listings"
            );
        }

        // Update text data
        listing.title =
            req.body.listing.title;

        listing.description =
            req.body.listing.description;

        listing.price =
            req.body.listing.price;

        listing.location =
            req.body.listing.location;

        listing.country =
            req.body.listing.country;

        // Geocoding
        const coordinates =
            await geocodeLocation(
                listing.location,
                listing.country
            );

        // Update geometry
        listing.geometry = {

            type: "Point",

            coordinates:
                coordinates

        };

        // Update image
        if (req.file) {

            listing.image = {

                filename:
                    req.file.filename,

                url:
                    req.file.path

            };
        }

        // Save
        await listing.save();

        // Success flash
        req.flash(
            "success",
            "Listing Updated Successfully!"
        );

        // Redirect
        res.redirect(
            `/listings/${id}`
        );
    };

// Delete listing
module.exports.destroyListing =
    async (
        req,
        res
    ) => {

        const {
            id
        } = req.params;

        const deletedListing =
            await Listing.findByIdAndDelete(
                id
            );

        // Listing not found
        if (!deletedListing) {

            req.flash(
                "error",
                "Listing no longer exists!"
            );

            return res.redirect(
                "/listings"
            );
        }

        console.log(
            "✅ Listing deleted"
        );

        // Success flash
        req.flash(
            "success",
            "Listing Deleted!"
        );

        // Redirect
        res.redirect(
            "/listings"
        );
    };