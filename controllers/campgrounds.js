const Campground = require("../models/campground")

module.exports.campgroundIndex = async  (req,res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index",{campgrounds});
}

module.exports.renderNewForm = async  (req,res) => {
    res.render("campgrounds/new");
}

module.exports.campgroundShowPage = async  (req,res) => {
    
    const camp = await Campground.findById(req.params.id).populate({
        //populating the authors of each review
            path:"reviews",
            populate:{
                path:"author"
            }
    }).populate("author");
    if(!camp){
        req.flash("error","Cannot find that camp")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show",{camp});
}

module.exports.editCampgroundPage = async (req,res) => {

    const camp = await Campground.findById(req.params.id);
    if(!camp){
        req.flash("error","Cannot find that camp")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", {camp})
}

module.exports.uploadCampground = async  (req,res,next) => {
    
    const camp = new Campground(req.body.campground);
    camp.author = req.user._id;
    camp.images =     req.files.map(image => ({filename: image.filename, url: image.path}));
    await camp.save();
    console.log(camp);
    req.flash("success","Succesfully made a new campground!")
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.editCampground = async (req,res,next) => {

    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    const imgs = req.files.map(image => ({filename: image.filename, url: image.path}));
    campground.images.push(...imgs);
    await campground.save();
    req.flash("success","Succesfully updated a campground!")
    res.redirect(`/campgrounds/${campground._id}`);

}

module.exports.deleteCampground = async (req,res) => {
    const {id} = req.params;
    const camp = await Campground.findByIdAndDelete(id, {...req.body.campground});
    req.flash("success","Deleted the Review!")
    res.redirect(`/campgrounds`);
}