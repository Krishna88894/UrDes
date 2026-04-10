const express = require("express");
const app = express();
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const path = require("path");
const ejsmate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const wrapAsync = require("./utils/wrapAsync.js");

// Global error handlers
process.on("unhandledRejection", (err) => {
    console.error("Unhandled Rejection:", err.message);
});

process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err.message);
});

app.use(methodOverride("_method"));
app.engine("ejs", ejsmate); 
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views")); 
app.use(express.static(path.join(__dirname, "public")));
app.use(express.urlencoded({extended : true}));

app.get("/", (req, res) =>{
    res.render("listings/home");
});

app.get("/listings", wrapAsync(async(req, res) =>{
    const list =  await Listing.find({});
    res.render("listings/index", {list});
}));

app.get("/listings/new", (req, res) =>{
    res.render("listings/new");
});

app.post("/listings", wrapAsync(async(req, res) =>{
    const newData = new Listing(req.body.listing);
    await newData.save();
    res.redirect("/listings");
}));

app.get("/listings/:id", wrapAsync(async(req, res) =>{
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Page Not Found");
    }
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    res.render("listings/show", {listing});
}));

app.get("/listings/:id/edit", wrapAsync(async(req, res) =>{
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Page Not Found");
    }
    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing not found");
    }
    res.render("listings/edit", {listing});
}));

app.put("/listings/:id", wrapAsync(async(req, res) =>{
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Page Not Found");
    }
    await Listing.findByIdAndUpdate(id, req.body.listing);
    res.redirect(`/listings/${id}`);
}));

app.delete("/listings/:id", wrapAsync(async(req, res) =>{
    const {id} = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
        throw new ExpressError(404, "Page Not Found");
    }
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));

app.use((req, res, next) =>{
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) =>{
    const {statusCode = 500, message = "Something went wrong"} = err;
    res.render("listings/error", {err, statusCode, message});
});

async function main(){
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/UrDes");
        console.log("Connected to MongoDB");
    } catch (err) {
        console.error("Failed to connect to MongoDB:", err.message);
    }
    
    const server = app.listen(8080, () =>{
        console.log("Server is running on port 8080");
    });

    server.on("error", (err) => {
        if (err.code === "EADDRINUSE") {
            console.error("Port 8080 already in use");
        } else {
            console.error("Server error:", err);
        }
    });
}

main();
