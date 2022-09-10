const express = require("express");
const mongoose = require("mongoose");
const router = express.Router();
const catchAsync = require("../utils/catchAsync.js");
const passport = require("passport");
const { isLoggedIn } = require("../middlewares");
const users = require("../controllers/users");


router.route("/register")
    .get(users.renderRegister)
    .post(users.registerUser);

router.route("/login")
    .get(users.renderLogin)
    .post(passport.authenticate("local", {failureFlash: true, failureRedirect: "/login", keepSessionInfo: true}), users.loginUser);

router.get("/logout", isLoggedIn, users.logoutUser);

module.exports = router;