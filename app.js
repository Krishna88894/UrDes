const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsmate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const listing = require("./router/listing.js");
const reviews = require("./router/review.js");
const isProduction = process.env.NODE_ENV === "production";
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || process.env.DB_URL || (!isProduction ? "mongodb://127.0.0.1:27017/UrDes" : null);
const PORT = process.env.PORT || 8080;
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

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

app.get("/", (req, res) => {
    res.render("listings/home");
});

app.use("/listings", listing);
app.use("/listings/:id/reviews", reviews);

app.use((req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).render("listings/error", { err, statusCode, message });
});

async function main() {
    if (!MONGO_URI) {
        console.error("Missing MongoDB URI. Set MONGODB_URI (or MONGO_URI/DB_URL) in environment variables.");
        process.exit(1);
    }

    try {
        await mongoose.connect(MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err.message);
        if (isProduction) {
            console.error("On Render, verify MONGODB_URI, Atlas IP access, and credentials in the connection string.");
        }
        process.exit(1);
    }

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}

main();
