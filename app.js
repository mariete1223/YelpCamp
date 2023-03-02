//if we are on production there is another way of settting enviroment variables
if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");
const flash = require("connect-flash");
const campgroundsRoutes = require("./routes/campgrounds")
const reviewsRoutes = require("./routes/reviews")
const userRoutes = require("./routes/users");
//PBKDF2 Hash algorythm
const passport = require("passport")
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require('express-mongo-sanitize');
const MongoDBStore = require("connect-mongo");
const helmet = require("helmet");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
   

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
app.use(express.static(path.join(__dirname, "public")))
app.use(mongoSanitize());

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

const store = new MongoDBStore({
    mongoUrl: "mongodb://localhost:27017/yelp-camp",
    secret,
    //time until session is updated
    touchAfter: 24*3600
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e)
})

const sessionConfig = {
    store,
    name: "__cc",
    secret,
    //About resave: this may have to be enabled for session stores that don't support the "touch" command. What this does is tell the session store that a particular session is still active, which is necessary because some stores will delete idle (unused) sessions after some time.

    //If a session store driver doesn't implement the touch command, then you should enable resave so that even when a session wasn't changed during a request, it is still updated in the store (thereby marking it active).
    resave: false,
    // If during the lifetime of the request the session object isn't modified then, at the end of the request and when saveUninitialized is false, the (still empty, because unmodified) session object will not be stored in the session store.
    saveUninitialized: true,
    //with "secure: true" option the cookie only is valid if we are in a https connection
    cookie: {
        expires: Date.now() + 1000 *60*60*24*7, //a week since Date.now()
        maxAge: 1000 *60*60*24*7,
        httpOnly:true
    } 
}
app.use(session(sessionConfig))
app.use(flash());
/*app.use(helmet());

const scriptSrcUrls = [
    "https://code.jquery.com/jquery-3.3.1.slim.min.js",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://cdn.jsdelivr.net/npm/bootstrap@5.2.1/dist/css/",
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);
*/
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

//storing and unstoring user in the session 
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//middleware who will add to all our request a local variable with (if exist) the message
app.use((req,res,next) => {
     if(!["/login","/","/register","/favicon.ico"].includes(req.originalUrl) && !req.originalUrl.includes("/reviews")){
         req.session.returnTo = req.originalUrl;
     }
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
}
)

//Exported routes
app.use("/campgrounds",campgroundsRoutes)
app.use("/campgrounds/:id/reviews",reviewsRoutes);
app.use("/",userRoutes);


app.get("/", (req,res) => {
    res.render("home")
});

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



