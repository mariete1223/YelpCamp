const express = require("express");
//if we want the value of the params specified on the root path we set on the app.use
//we have to set this option to true
const router = express.Router({mergeParams: true});
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const {reviewSchema } = require("../schemas");
const Review = require("../models/review");
const Campground = require("../models/campground");

const validateReview = (req,res,next) => {

    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(e => e.message).join(",");
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}

router.post("/", validateReview, catchAsync(async (req,res,next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await campground.save();
    await review.save();
    res.redirect(`/campgrounds/${campground._id}`);
    

}));

router.delete("/:reviewId", catchAsync(async(req,res) => {
    console.log("aaaaaaaaaaaaaaaaaaaaa")
    const {id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
    
}));

module.exports = router;