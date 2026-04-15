const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const ejsmate = require("ejs-mate");
const methodOverride = require("method-override");
const Listing = require("./models/listing.js");
const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");
const Review = require("./models/review.js");




const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/UrDes";
const PORT = process.env.PORT || 8080;

process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err.message);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err.message);
});

app.engine("ejs", ejsmate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
    res.render("listings/home");
});

app.get("/listings", wrapAsync(async (req, res) => {
    const list = await Listing.find({});
    res.render("listings/index", { list });
}));

app.get("/listings/new", (req, res) => {
    res.render("listings/new");
});

app.post("/listings", wrapAsync(async (req, res) => {
    const newData = new Listing(req.body.listing);
    await newData.save();
    res.redirect("/listings");
}));

app.get("/listings/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
}));

app.get("/listings/:id/edit", wrapAsync(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Page Not Found");
    }

    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.render("listings/edit", { listing });
}));

app.get("/listings/:id/reviews", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/reviews", { listing });
}));
app.post("/listings/:id/reviews", wrapAsync(async (req, res) => {
    const { id } = req.params;  
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Page Not Found");
    }
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    const review = new Review(req.body);
    await review.save();
    listing.reviews.push(review);
    await listing.save();
    res.redirect(`/listings/${id}`);
}));

app.delete("/listings/:id/reviews/:reviewid", wrapAsync(async(req, res) => {
    const { id, reviewid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(reviewid)) {
        throw new ExpressError(404, "Page Not Found");
    }
    const listing = await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    await Review.findByIdAndDelete(reviewid);
    res.redirect(`/listings/${id}`);
}));

app.delete("/listings/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Page Not Found");
    }
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

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

    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });

    server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
            console.error(`Port ${PORT} already in use`);
        } else {
            console.error("Server error:", err);
        }
    });
}

main();
