const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const Campground = require("./models/campground");
const methodOverride = require("method-override");
const { nextTick } = require("process");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const {campgroundSchema} = require("./schemas");
const Joi = require("joi");

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

const validateCampground = (req,res,next) => {

    const {error} = campgroundSchema.validate(req.body);
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
  
    const camp = await Campground.findById(req.params.id);
    res.render("campgrounds/show",{camp});
});

app.get("/campgrounds/:id/edit", catchAsync(async (req,res) => {

    const camp = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", {camp})
}));

app.post("/campgrounds", validateCampground, catchAsync(async  (req,res,next) => {
    
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
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



