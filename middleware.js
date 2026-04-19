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