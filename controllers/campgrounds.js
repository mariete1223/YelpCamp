const Campground = require("../models/campground")
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const geocodingService = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

const {cloudinary} = require("../cloudinary");

module.exports.campgroundIndex = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
}

module.exports.renderNewForm = async (req, res) => {
    res.render("campgrounds/new");
}

module.exports.campgroundShowPage = async (req, res) => {

    const camp = await Campground.findById(req.params.id).populate({
        //populating the authors of each review
        path: "reviews",
        populate: {
            path: "author"
        }
    }).populate("author");
    if (!camp) {
        req.flash("error", "Cannot find that camp")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/show", { camp });
}

module.exports.editCampgroundPage = async (req, res) => {

    const camp = await Campground.findById(req.params.id);
    if (!camp) {
        req.flash("error", "Cannot find that camp")
        return res.redirect("/campgrounds")
    }
    res.render("campgrounds/edit", { camp })
}

module.exports.uploadCampground = async (req, res, next) => {
    const geoData = await geocodingService.forwardGeocode({
        query: req.body.campground.location,
        limit: 1
    }).send();
    const camp = new Campground(req.body.campground);
    camp.author = req.user._id;
    camp.geometry = geoData.body.features[0].geometry;
    camp.images = req.files.map(image => ({ filename: image.filename, url: image.path }));
    await camp.save();
    req.flash("success", "Succesfully made a new campground!")
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.editCampground = async (req, res, next) => {

    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground })
    const imgs = req.files.map(image => ({ filename: image.filename, url: image.path }));
    campground.images.push(...imgs);
    await campground.save();
    if (req.body.deleteImages) {
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await campground.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } });
    }
    req.flash("success", "Succesfully updated a campground!")
    res.redirect(`/campgrounds/${campground._id}`);

}

module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findByIdAndDelete(id, { ...req.body.campground });
    req.flash("success", "Deleted the Review!")
    res.redirect(`/campgrounds`);
}