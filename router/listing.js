const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");

router.get("/", wrapAsync(async (req, res) => {
    const list = await Listing.find({});
    res.render("listings/index", { list });
}));

router.get("/new", (req, res) => {
    res.render("listings/new");
});

router.post("/", wrapAsync(async (req, res) => {
    const newData = new Listing(req.body.listing);
    await newData.save();
    res.redirect("/listings");
}));

router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
}));

router.get("/:id/edit", wrapAsync(async (req, res) => {
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

router.put("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Page Not Found");
    }

    if (!req.body.listing) {
        throw new ExpressError(400, "Invalid listing data");
    }

    const listingData = { ...req.body.listing };
    if (typeof listingData.image === "string") {
        listingData.image = { url: listingData.image };
    }

    const listing = await Listing.findByIdAndUpdate(id, listingData, {
        new: true,
        runValidators: true,
    });

    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }

    res.redirect(`/listings/${id}`);
}));

router.delete("/:id", wrapAsync(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Page Not Found");
    }
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

module.exports = router;