const Listing = require("../models/listing");
const mongoose = require("mongoose");
const ExpressError = require("../utils/ExpressError.js");
const mbxgeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_ACCESS_TOKEN;
const geocodingClient = mbxgeocoding({accessToken : mapToken});


module.exports.index = async (req, res) => {
    const list = await Listing.find({});
    res.render("listings/index", { list });
};
module.exports.new = (req, res) => {
    res.render("listings/new");
};

module.exports.newlisting = async (req, res) => {
    const geocodeResult = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
        })
        .send();
    const feature = geocodeResult.body.features[0];
    if (!feature) {
        throw new ExpressError(400, "Unable to find coordinates for the provided location");
    }
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;
    if (req.file) {
        const { filename, path: url } = req.file;
        newListing.image = { url, filename };
    }
    newListing.geometry = feature.geometry;
    await newListing.save();
    req.flash("success", "Listing Creation Successful");
    res.redirect("/listings");
};

module.exports.showlisting = async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id).populate("reviews").populate("owner");
    if(!listing){
        req.flash("error", "Listing doesn't exist");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", { listing });
};

module.exports.editlistingshow = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Page Not Found");
    }

    const listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing doesn't exist");
        return res.redirect("/listings");
    }
    res.render("listings/edit", { listing });
};

module.exports.editlisting = async (req, res) => {
    const { id } = req.params;
    const listingData = { ...req.body.listing };
    const existingListing = await Listing.findById(id);

    if (!existingListing) {
        req.flash("error", "Listing doesn't exist");
        return res.redirect("/listings");
    }

    const existingLocation = (existingListing.location || "").trim();
    const updatedLocation = (listingData.location || "").trim();

    if (updatedLocation && updatedLocation !== existingLocation) {
        const geocodeResult = await geocodingClient
            .forwardGeocode({
                query: updatedLocation,
                limit: 1,
            })
            .send();

        const feature = geocodeResult.body.features[0];
        if (!feature) {
            throw new ExpressError(400, "Unable to find coordinates for the updated location");
        }
        listingData.geometry = feature.geometry;
    }

    const listing = await Listing.findByIdAndUpdate(id, listingData, {
        new: true,
        runValidators: true,
    });
    if (req.file) {
        const { filename, path: url } = req.file;
        listing.image = { url, filename };
        await listing.save();
    }
    req.flash("success", "Updation Successful");
    res.redirect(`/listings/${id}`);
};

module.exports.dltlisting = async (req, res) => {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Page Not Found");
    }
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Deletion Successful");
    res.redirect("/listings");
};