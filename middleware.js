const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
module.exports.login = (req, res, next) =>{
     if(!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "Login or signup first");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveredirectUrl = (req, res, next) =>{
    if(req.session.redirectUrl){
        res.locals.redirectUrl = req.session.redirectUrl;
        delete req.session.redirectUrl;
    }
    next();
}

module.exports.ownerL = async(req, res, next) =>{
    let {id} = req.params;
    let listing = await Listing.findById(id);
    if(!listing){
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    if(!res.locals.currentUser || !listing.owner || !listing.owner.equals(res.locals.currentUser._id)){
        req.flash("error", "Access Denied");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.ownerR = async(req, res, next) =>{
    const { id, reviewid } = req.params;
    const review = await Review.findById(reviewid);
    if(!review){
        req.flash("error", "Review not found");
        return res.redirect(`/listings/${id}`);
    }

    const currentUser = res.locals.currentUser;
    const userName = currentUser && currentUser.username ? currentUser.username.trim().toLowerCase() : "";
    const reviewName = review.name ? review.name.trim().toLowerCase() : "";
    const byAuthorId = currentUser && review.author && review.author.equals(currentUser._id);
    const byAuthorName = userName && reviewName && userName === reviewName;

    if(!currentUser || (!byAuthorId && !byAuthorName)){
        req.flash("error", "Access Denied");
        return res.redirect(`/listings/${id}`);
    }
    next();
}
