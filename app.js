require("dotenv").config();

const express = require("express");
const app = express();

const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");

const ExpressError = require("./utils/ExpressError.js");

const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const session = require("express-session");
const { MongoStore } = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");

const User = require("./models/user.js");


// MongoDB Atlas
const dbUrl = process.env.ATLASDB_URL;


// MongoDB connection
async function main() {
    await mongoose.connect(dbUrl);
    console.log("Connected to DB");
}

main().catch((err) => {
    console.log("MongoDB connection error:", err);
});


// EJS setup
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));


// Body parser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());


// Method override
app.use(methodOverride("_method"));


// Static files
app.use(express.static(path.join(__dirname, "public")));

app.use(
    "/uploads",
    express.static(path.join(__dirname, "uploads"))
);


// MongoDB session store
const store = MongoStore.create({
    mongoUrl: dbUrl,

    crypto: {
        secret: process.env.SECRET
    },

    touchAfter: 24 * 3600
});

store.on("error", (err) => {
    console.log("ERROR IN MONGO SESSION STORE", err);
});


// Session
const sessionOptions = {
    store,

    secret: process.env.SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {
        expires: new Date(
            Date.now() + 7 * 24 * 60 * 60 * 1000
        ),

        maxAge: 7 * 24 * 60 * 60 * 1000,

        httpOnly: true
    }
};

app.use(session(sessionOptions));


// Flash messages
app.use(flash());


// Passport
app.use(passport.initialize());
app.use(passport.session());

passport.use(
    new LocalStrategy(User.authenticate())
);

passport.serializeUser(
    User.serializeUser()
);

passport.deserializeUser(
    User.deserializeUser()
);


// Global variables
app.use((req, res, next) => {
    res.locals.currentUser = req.user || null;

    res.locals.success = req.flash("success");

    res.locals.error = req.flash("error");

    res.locals.mapToken = process.env.MAP_TOKEN;

    next();
});


// Home route
app.get("/", (req, res) => {
    res.redirect("/listings");
});


// Listing routes
app.use(
    "/listings",
    listingRouter
);


// Review routes
app.use(
    "/listings/:id/reviews",
    reviewRouter
);


// User routes
app.use(
    "/",
    userRouter
);


// 404 error
app.all("/{*splat}", (req, res, next) => {
    next(
        new ExpressError(
            404,
            "Page not found"
        )
    );
});


// Error handling
app.use((err, req, res, next) => {
    const {
        statusCode = 500,
        message = "Something went wrong"
    } = err;

    console.log("❌ ERROR:", err);

    res
        .status(statusCode)
        .render("error.ejs", {
            message
        });
});


// Server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});