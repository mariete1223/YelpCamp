const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync.js");
const campgrounds = require("../controllers/campgrounds");
const {isLoggedIn, isCampgroundAuthor, validateCampground} = require("../middlewares");
const multer = require("multer")
const {storage} = require("../cloudinary");
const upload = multer({storage}) 

router.route("/")
    .get(catchAsync(campgrounds.campgroundIndex))
    .post(isLoggedIn, upload.array("image"),validateCampground,  catchAsync(campgrounds.uploadCampground));


router.get("/new", isLoggedIn ,catchAsync(campgrounds.renderNewForm));

router.route("/:id")
    .get( catchAsync(campgrounds.campgroundShowPage))
    .put(isLoggedIn, isCampgroundAuthor, upload.array("image")/*,validateCampground*/, catchAsync(campgrounds.editCampground))
    .delete(isLoggedIn, isCampgroundAuthor, catchAsync(campgrounds.deleteCampground));

router.get("/:id/edit",isLoggedIn, isCampgroundAuthor, catchAsync(campgrounds.editCampgroundPage));

module.exports = router;