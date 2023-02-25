const User = require("../models/user");
module.exports.renderRegister = async (req,res) => {
    res.render("users/register");
}

module.exports.registerUser = async (req,res) => {
    try{
         
        const {email, username, password} = req.body;
        const newUser = new User({email, username})
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash("success","Welcome to YelpCamp")
            res.redirect("/campgrounds");
        })
        

    }catch(e){

        req.flash("error", e.message);
        res.redirect("/register")
    
    }
}

module.exports.renderLogin = async (req,res) => {
    res.render("users/login");
}

module.exports.loginUser = (req,res,next) => {
    req.flash("success","Welcome back!!");
    console.log(req.session.returnTo)
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.logoutUser = (req,res,next) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash("success","Goodbye!!");
        res.redirect("/campgrounds");
    });
} 