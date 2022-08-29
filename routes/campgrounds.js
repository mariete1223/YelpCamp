const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const {campgroundSchema } = require("../schemas");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const validateCampground = (req,res,next) => {
    
    if(!imageExists(req.body.campground.image)){
        throw new ExpressError("Ivalid image check if it exists",400);
    }

    const {error} = campgroundSchema.validate(req.body);
    if(error){
        const msg = error.details.map(e => e.message).join(",");
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}

function imageExists(image_url){

    var http = new XMLHttpRequest();

    http.open('HEAD', image_url, false);
    http.send();
    console.log(http.status)
    return !http.status.toString().startsWith("4");

}

router.get("/", catchAsync(async  (req,res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index",{campgrounds});
}));

router.get("/new", async  (req,res) => {
    res.render("campgrounds/new");
});

router.get("/:id", async  (req,res) => {
    
    const camp = await (await Campground.findById(req.params.id)).populate("reviews");
    res.render("campgrounds/show",{camp});
});

router.get("/:id/edit", catchAsync(async (req,res) => {

    const camp = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", {camp})
}));

router.post("/", validateCampground, catchAsync(async  (req,res,next) => {
    
    const camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
}));

router.put("/:id", validateCampground, catchAsync(async (req,res,next) => {

    const {id} = req.params;
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${camp._id}`);

}));

router.delete("/:id", catchAsync(async (req,res) => {
    const {id} = req.params;
    const camp = await Campground.findByIdAndDelete(id, {...req.body.campground})
    res.redirect(`/campgrounds`);
}));

module.exports = router;