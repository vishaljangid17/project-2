// ==================================================
// DOTENV
// ==================================================

require("dotenv").config();


// ==================================================
// IMPORTS
// ==================================================

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


// ==================================================
// MONGODB URL
// ==================================================

// Local MongoDB
// const dbUrl = "mongodb://127.0.0.1:27017/wanderlust";

// MongoDB Atlas
const dbUrl = process.env.ATLASDB_URL;


// ==================================================
// MONGODB CONNECTION
// ==================================================

async function main() {

    await mongoose.connect(dbUrl);

    console.log("Connected to DB");

}

main().catch((err) => {

    console.log(
        "MongoDB connection error:",
        err
    );

});


// ==================================================
// EJS SETUP
// ==================================================

app.engine(
    "ejs",
    ejsMate
);

app.set(
    "view engine",
    "ejs"
);

app.set(
    "views",
    path.join(__dirname, "views")
);


// ==================================================
// BODY PARSER MIDDLEWARE
// ==================================================

app.use(
    express.urlencoded({
        extended: true
    })
);

app.use(
    express.json()
);


// ==================================================
// METHOD OVERRIDE
// ==================================================

app.use(
    methodOverride("_method")
);


// ==================================================
// STATIC FILES
// ==================================================

app.use(
    express.static(
        path.join(__dirname, "public")
    )
);

app.use(
    "/uploads",
    express.static(
        path.join(__dirname, "uploads")
    )
);


// ==================================================
// MONGO SESSION STORE
// ==================================================

const store = MongoStore.create({

    mongoUrl: dbUrl,

    crypto: {
        secret: process.env.SECRET,
    },

    touchAfter: 24 * 3600

});


// MongoDB session store error
store.on("error", (err) => {

    console.log(
        "ERROR IN MONGO SESSION STORE",
        err
    );

});


// ==================================================
// SESSION
// ==================================================

const sessionOptions = {

    store,

    secret: process.env.SECRET,

    resave: false,

    saveUninitialized: false,

    cookie: {

        expires: new Date(
            Date.now() +
            7 * 24 * 60 * 60 * 1000
        ),

        maxAge:
            7 * 24 * 60 * 60 * 1000,

        httpOnly: true

    }

};


app.use(
    session(sessionOptions)
);


// ==================================================
// FLASH
// ==================================================

app.use(
    flash()
);


// ==================================================
// PASSPORT INITIALIZATION
// ==================================================

app.use(
    passport.initialize()
);

app.use(
    passport.session()
);


// ==================================================
// PASSPORT LOCAL STRATEGY
// ==================================================

passport.use(
    new LocalStrategy(
        User.authenticate()
    )
);


// ==================================================
// PASSPORT SERIALIZE / DESERIALIZE
// ==================================================

passport.serializeUser(
    User.serializeUser()
);

passport.deserializeUser(
    User.deserializeUser()
);


// ==================================================
// GLOBAL VARIABLES
// ==================================================

app.use(
    (req, res, next) => {

        // Current logged-in user
        res.locals.currentUser =
            req.user || null;


        // Success flash messages
        res.locals.success =
            req.flash("success");


        // Error flash messages
        res.locals.error =
            req.flash("error");


        // Mapbox token
        res.locals.mapToken =
            process.env.MAP_TOKEN;


        next();

    }
);


// ==================================================
// HOME ROUTE
// ==================================================

// app.get(
//     "/",
//     (req, res) => {
//         res.send("Hi, I am root");
//     }
// );


// ==================================================
// LISTING ROUTES
// ==================================================

app.use(
    "/listings",
    listingRouter
);


// ==================================================
// REVIEW ROUTES
// ==================================================

app.use(
    "/listings/:id/reviews",
    reviewRouter
);


// ==================================================
// USER ROUTES
// ==================================================

app.use(
    "/",
    userRouter
);


// ==================================================
// 404 ERROR
// ==================================================

app.all(
    "/{*splat}",
    (req, res, next) => {

        next(
            new ExpressError(
                404,
                "Page not found"
            )
        );

    }
);


// ==================================================
// ERROR HANDLING
// ==================================================

app.use(
    (err, req, res, next) => {

        const {
            statusCode = 500,
            message = "Something went wrong"
        } = err;


        console.log(
            "❌ ERROR:",
            err
        );


        res
            .status(statusCode)
            .render(
                "error.ejs",
                {
                    message
                }
            );

    }
);


// ==================================================
// SERVER
// ==================================================

app.listen(
    8080,
    () => {

        console.log(
            "Server is listening on port 8080"
        );

    }
);