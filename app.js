const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const Campground = require("./models/campground");
const methodOverride = require("method-override");
const { nextTick } = require("process");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const {campgroundSchema , reviewSchema} = require("./schemas");
const Review = require("./models/review");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database Connected");
})

const app = express();

app.engine("ejs", ejsMate)
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(methodOverride("_method"))
app.use(express.urlencoded({extended: true}))

function imageExists(image_url){

    var http = new XMLHttpRequest();

    http.open('HEAD', image_url, false);
    http.send();
    console.log(http.status)
    return !http.status.toString().startsWith("4");

}

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

const validateReview = (req,res,next) => {

    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(e => e.message).join(",");
        throw new ExpressError(msg,400);
    }else{
        next();
    }
}

app.get("/", (req,res) => {
    res.render("home")
});

app.get("/campgrounds", async  (req,res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index",{campgrounds});
});

app.get("/campgrounds/new", async  (req,res) => {
    res.render("campgrounds/new");
});

app.get("/campgrounds/:id", async  (req,res) => {
    
    const camp = await (await Campground.findById(req.params.id)).populate("reviews");
    res.render("campgrounds/show",{camp});
});

app.get("/campgrounds/:id/edit", catchAsync(async (req,res) => {

    const camp = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", {camp})
}));

app.post("/campgrounds", validateCampground, catchAsync(async  (req,res,next) => {
    
    const camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
}));

app.post("/campgrounds/:campId/reviews", validateReview, catchAsync(async (req,res,next) => {
    const {campId} = req.params;
    const campground = await Campground.findById(campId);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await campground.save();
    await review.save();
    res.redirect(`/campgrounds/${campground._id}`);
    

}));

app.put("/campgrounds/:id", validateCampground, catchAsync(async (req,res,next) => {

    const {id} = req.params;
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${camp._id}`);

}));

app.delete("/campgrounds/:id", catchAsync(async (req,res) => {
    const {id} = req.params;
    const camp = await Campground.findByIdAndDelete(id, {...req.body.campground})
    res.redirect(`/campgrounds`);
}));

app.delete("/campgrounds/:id/reviews/:reviewId", catchAsync(async(req,res) => {
    console.log("aaaaaaaaaaaaaaaaaaaaa")
    const {id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, {pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
    
}));

app.all('*', (req,res,next) => {
    next(new ExpressError("Page Not Found!!",404));
})

app.use((err,req,res,next) => {
    const {statusCode = 500} = err;
    if(!err.message) err.message= "Something Went Wrong!!"
    res.status(statusCode).render("error", {err});
})

app.listen(3000,() => {
    console.log("serving in port 3000")
});



