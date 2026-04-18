const express = require("express");
const router = express.Router({mergeParams : true}); //params in the parent route can be used via mergeParams like in "/listings/:id/reviews" earlier thorwing error but via mergeParams executes normally
const mongoose = require("mongoose");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

router.get("/", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    res.render("listings/reviews", { listing });
}));

router.post("/", wrapAsync(async (req, res) => {
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
    req.flash("success", "Review Added Successfully");
    res.redirect(`/listings/${id}`);
}));

router.delete("/:reviewid", wrapAsync(async(req, res) => {
    const { id, reviewid } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(reviewid)) {
        throw new ExpressError(404, "Page Not Found");
    }
    const listing = await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    await Review.findByIdAndDelete(reviewid);
    req.flash("success", "Review Deleted Successfully");
    res.redirect(`/listings/${id}`);
}));
module.exports = router;