const Review = require("../models/review");
const mongoose = require("mongoose");
const Listing = require("../models/listing");
const ExpressError = require("../utils/ExpressError.js");

 module.exports.showreview = async (req, res) => {
     const { id } = req.params;
     if (!mongoose.Types.ObjectId.isValid(id)) {
         throw new ExpressError(404, "Page Not Found");
     }
     const listing = await Listing.findById(id);
     if (!listing) {
         throw new ExpressError(404, "Listing not found");
     }
     res.render("listings/reviews", { listing });
 };

 module.exports.addreview = async (req, res) => {
    const { id } = req.params;  
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Page Not Found");
    }
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    const review = new Review(req.body);
    review.author = req.user._id;
    review.name = review.name || req.user.username;
    await review.save();
    listing.reviews.push(review);
    await listing.save();
    req.flash("success", "Review Added Successfully");
    res.redirect(`/listings/${id}`);
 };

 module.exports.dltreview = async(req, res) => {
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
 };
