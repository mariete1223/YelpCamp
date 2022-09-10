const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync.js");
const campgrounds = require("../controllers/campgrounds");
const {isLoggedIn, isCampgroundAuthor, validateCampground} = require("../middlewares");


router.route("/")
    .get(catchAsync(campgrounds.campgroundIndex))
    .post(isLoggedIn, isCampgroundAuthor, validateCampground, catchAsync(campgrounds.uploadCampground));

router.get("/new", catchAsync(campgrounds.renderNewForm));

router.route("/:id")
    .get( catchAsync(campgrounds.campgroundShowPage))
    .put(isLoggedIn, isCampgroundAuthor, validateCampground, catchAsync(campgrounds.editCampground))
    .delete(isLoggedIn, isCampgroundAuthor, catchAsync(campgrounds.deleteCampground));



// router.get("/", catchAsync(campgrounds.campgroundIndex));

router.get("/:id/edit",isLoggedIn, isCampgroundAuthor, catchAsync(campgrounds.editCampgroundPage));

// router.post("/",isLoggedIn, isCampgroundAuthor, validateCampground, catchAsync(campgrounds.uploadCampground));

// router.put("/:id", isLoggedIn, isCampgroundAuthor, validateCampground, catchAsync(campgrounds.editCampground));

// router.delete("/:id",isLoggedIn, isCampgroundAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;