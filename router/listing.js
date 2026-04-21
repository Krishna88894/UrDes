const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Listing = require("../models/listing.js");
const ExpressError = require("../utils/ExpressError.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {login, ownerL} = require("../middleware.js");
const controllerL = require("../controller/listing.js");
const multer = require("multer"); 
const {storage} = require("../CC.js");
const upload = multer({storage});

router.get("/", wrapAsync(controllerL.index));

router.post("/", login,upload.single("listing[image]"), wrapAsync(controllerL.newlisting));

router.get("/new", login, controllerL.new);

router.get("/:id", wrapAsync(controllerL.showlisting));

router.get("/:id/edit", login,ownerL, wrapAsync(controllerL.editlistingshow));

router.put("/:id", login, ownerL, wrapAsync(controllerL.editlisting));

router.delete("/:id",login,ownerL, wrapAsync(controllerL.dltlisting));

module.exports = router;