const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveredirectUrl } = require("../middleware.js");
const controllerU = require("../controller/user.js");

//user signup
router.get("/signup", controllerU.usersignup);

router.post("/signup", wrapAsync(controllerU.adduser));

//user login
router.get("/login", (req, res) => {
    res.render("users/login");
});

router.post(
    "/login",
    saveredirectUrl,
    wrapAsync(controllerU.loginuser),
    passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }),
    controllerU.postlogin
);

router.get("/logout", controllerU.logoutuser);

module.exports = router;