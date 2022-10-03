const ExpressError = require("./utils/ExpressError");
const {campgroundSchema, reviewSchema } = require("./schemas");
const Campground = require("./models/campground");
const Review = require("./models/review");


module.exports.isLoggedIn = (req,res,next) => {
    if(!req.isAuthenticated()) {

        req.session.returnTo = req.originalUrl;

        req.flash("error","you must be signed in");
        return res.redirect("/login")
    }
    next();
}

function imageExists(image_url){

    var http = new XMLHttpRequest();

    http.open('HEAD', image_url, false);
    http.send();
    console.log(http.status)
    return !http.status.toString().startsWith("4");

}

module.exports.validateCampground = (req,res,next) => {
    console.log(req.body);
    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(e => e.message).join(",");
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}

module.exports.isCampgroundAuthor = async (req,res,next) => {
    const {id} = req.params;
    const camp = await Campground.findById(id);
    if(!camp.author.equals(req.user._id)){
        req.flash("error","You dont have permission to do that")
        return res.redirect(`/campgrounds/${camp._id}`);

    }
    next();
}

module.exports.isReviewAuthor = async (req,res,next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash("error","You dont have permission to do that")
        return res.redirect(`/campgrounds/${review._id}`);

    }
    next();
}

module.exports.validateReview = (req,res,next) => {

    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(e => e.message).join(",");
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}