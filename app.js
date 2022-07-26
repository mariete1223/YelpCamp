const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const Campground = require("./models/campground");
const methodOverride = require("method-override")

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

app.get("/campgrounds/:id/edit", async (req,res) => {

    const camp = await Campground.findById(req.params.id);
    res.render("campgrounds/edit", {camp})
});

app.post("/campgrounds", async  (req,res) => {
    
    const camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`);
});

app.put("/campgrounds/:id", async (req,res) => {
    const {id} = req.params;
    console.log(id)
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    res.redirect(`/campgrounds/${camp._id}`);
});

app.delete("/campgrounds/:id", async (req,res) => {
    const {id} = req.params;
    const camp = await Campground.findByIdAndDelete(id, {...req.body.campground})
    res.redirect(`/campgrounds`);
});



app.listen(3000,() => {
    console.log("serving in port 3000")
});



