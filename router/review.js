const express = require("express");
const router = express.Router({mergeParams : true}); //params in the parent route can be used via mergeParams like in "/listings/:id/reviews" earlier thorwing error but via mergeParams executes normally
const mongoose = require("mongoose");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const Review = require("../models/review.js");
const Listing = require("../models/listing.js");
const {login, ownerR} = require("../middleware.js");
const controllerR = require("../controller/review.js");

router.get("/", login, wrapAsync(controllerR.showreview));
router.post("/", login, wrapAsync(controllerR.addreview));
router.delete("/:reviewid", login, ownerR, wrapAsync(controllerR.dltreview));

module.exports = router;