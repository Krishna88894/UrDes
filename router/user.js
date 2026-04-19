const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveredirectUrl } = require("../middleware.js");

//user signup
router.get("/signup", (req, res) => {
    res.render("users/signup");
});

router.post("/signup", wrapAsync(async(req, res, next) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email });
        const userRegistered = await User.register(newUser, password);
        req.login(userRegistered, (err) => {
            if (err) {
                return next(err);
            }
            req.flash("success", "Registration Successful, Welcome!");
            res.redirect("/listings");
        });
    } catch (err) {
        req.flash("error", err.message);
        res.redirect("/signup");
    }
}));

//user login
router.get("/login", (req, res) => {
    res.render("users/login");
});

router.post("/login",
 saveredirectUrl,
 wrapAsync(async (req, res, next) => {
    const existingUser = await User.findOne({ username: req.body.username });
    if (!existingUser) {
        req.flash("error", "User does not exist. Please sign up first.");
        return res.redirect("/signup");
    }
    next();
 }),
 passport.authenticate("local", {failureRedirect: "/login", failureFlash: true }), //middleware for authenticate the user is registered or not
 async(req, res) =>{
    req.flash("success", "Log in successful");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
});

router.get("/logout", (req, res, next) =>{
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logout Success");
        res.redirect("/listings");
    });
});

module.exports = router;