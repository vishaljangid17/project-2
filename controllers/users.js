const User = require("../models/user");


// ==================================================
// SIGNUP PAGE
// ==================================================

module.exports.renderSignup = (req, res) => {
    res.render("users/signup.ejs");
};


// ==================================================
// SIGNUP
// ==================================================

module.exports.signUp = async (req, res, next) => {

    try {

        const { username, email, password } = req.body;

        const newUser = new User({
            username,
            email
        });

        const registeredUser = await User.register(
            newUser,
            password
        );


        // Automatically login after signup
        req.login(registeredUser, (err) => {

            if (err) {
                return next(err);
            }


            req.flash(
                "success",
                "Welcome to Wanderlust! 👋"
            );


            // ------------------------------------------
            // IMPORTANT:
            // If user originally clicked "Become a host",
            // send them back to the page they wanted.
            // ------------------------------------------

            const redirectUrl =
                res.locals.redirectUrl || "/listings";


            delete req.session.redirectUrl;


            res.redirect(redirectUrl);

        });

    } catch (e) {

        req.flash(
            "error",
            e.message
        );

        res.redirect("/signup");
    }
};


// ==================================================
// LOGIN PAGE
// ==================================================

module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};


// ==================================================
// LOGIN
// ==================================================

module.exports.login = (req, res) => {

    req.flash(
        "success",
        "Welcome back! 👋"
    );


    // ------------------------------------------
    // Return user to the page they originally
    // wanted to visit.
    // ------------------------------------------

    const redirectUrl =
        res.locals.redirectUrl || "/listings";


    delete req.session.redirectUrl;


    res.redirect(redirectUrl);
};


// ==================================================
// LOGOUT
// ==================================================

module.exports.logout = (req, res, next) => {

    req.logout((err) => {

        if (err) {
            return next(err);
        }


        req.flash(
            "success",
            "See you soon! 👋"
        );


        res.redirect("/listings");
    });
};