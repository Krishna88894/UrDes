if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsmate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const listingR = require("./router/listing.js");
const reviewsR = require("./router/review.js");
const userR = require("./router/user.js");
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/UrDes";
const PORT = process.env.PORT || 8080;
const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user.js");
const session = require("express-session");
const flash = require("connect-flash");


app.engine("ejs", ejsmate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const sessionOptions = {
    secret : "anonymous",
    resave : false,
    saveUninitialized : true,
    cookie : {
        expires: Date.now() + 5 * 24 * 60 * 60 * 1500,
        maxAge :  5 * 24 * 60 * 60 * 1500,
        httpOnly : true,
    },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session()); //in a session multiple req, res undertakes by user, doesn't login again n again
passport.use(new localStrategy(User.authenticate())); //makes user login/signup
passport.serializeUser(User.serializeUser()); //stores user related info for a session
passport.deserializeUser(User.deserializeUser()); //removes the stored info after session over

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

app.get("/", (req, res) => {
    res.render("listings/home");
});

app.use("/listings", listingR);
app.use("/listings/:id/reviews", reviewsR);
app.use("/", userR);

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("listings/error", { err, statusCode, message });
});

async function main() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err.message);
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

main();
