const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const session = require("express-session");

const campgrounds = require("./routes/campgrounds")
const reviews = require("./routes/reviews")

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

const sessionConfig = {
    secret: "thisshouldbeabettersecret",
    //About resave: this may have to be enabled for session stores that don't support the "touch" command. What this does is tell the session store that a particular session is still active, which is necessary because some stores will delete idle (unused) sessions after some time.

    //If a session store driver doesn't implement the touch command, then you should enable resave so that even when a session wasn't changed during a request, it is still updated in the store (thereby marking it active).
    resave: false,
    // If during the lifetime of the request the session object isn't modified then, at the end of the request and when saveUninitialized is false, the (still empty, because unmodified) session object will not be stored in the session store.
    saveUninitialized: true,

    cookie: {
        expires: Date.now() + 1000 *60*60*24*7, //a week since Date.now()
        maxAge: 1000 *60*60*24*7,
        httpOnly:true
    } 
}
app.use(session(sessionConfig))

app.use("/campgrounds",campgrounds)
app.use("/campgrounds/:id/reviews",reviews);


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



