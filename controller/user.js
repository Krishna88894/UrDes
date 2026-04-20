const User = require("../models/user.js");

module.exports.usersignup = (req, res) => {
    res.render("users/signup");
};

module.exports.adduser = async(req, res, next) => {
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
};

module.exports.loginuser = async (req, res, next) => {
    const existingUser = await User.findOne({ username: req.body.username });
    if (!existingUser) {
        req.flash("error", "User does not exist. Please sign up first.");
        return res.redirect("/signup");
    }
    next();
};

module.exports.postlogin = async(req, res) =>{
    req.flash("success", "Log in successful");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

module.exports.logoutuser = (req, res, next) =>{
    req.logOut((err) => {
        if (err) {
            return next(err);
        }
        req.flash("success", "Logout Success");
        res.redirect("/listings");
    });
};
