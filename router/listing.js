const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {login} = require("../middleware.js");

router.get("/", wrapAsync(async (req, res) => {
    const list = await Listing.find({});
    res.render("listings/index", { list });
}));

router.get("/new", login, (req, res) => {
    res.render("listings/new");
});

router.post("/", login, wrapAsync(async (req, res) => {
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success", "Listing Creation Successful");
    res.redirect("/listings");
}));

router.get("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
    if(!listing){
        req.flash("error", "Listing doesn't exits");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
}));

router.get("/:id/edit", login, wrapAsync(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Page Not Found");
    }

    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing doesn't exits");
        return res.redirect("/listings");
    }
    res.render("listings/edit", { listing });
}));

router.put("/:id", login, wrapAsync(async (req, res) => {
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
   
    req.flash("success", "Updation Successful");
    res.redirect(`/listings/${id}`);
}));

router.delete("/:id",login, wrapAsync(async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Page Not Found");
    }
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Deletion Successful");
    res.redirect("/listings");
}));

module.exports = router;