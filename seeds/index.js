const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const { places, descriptors } = require("./seedHelpers");
const Campground = require("../models/campground");
const cities = require("./city")

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
    console.log("Database Connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < 200; i++) {
        const citySample = sample(cities)
        const randomPrice = Math.floor(Math.random() * 50) + 10;
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            location: `${citySample.city} , ${citySample.state}`,
            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Debitis iste atque distinctio sapiente, quos nulla aliquid? Fugiat provident odit aut. Illum, molestias incidunt placeat debitis possimus officia praesentium voluptas alias.",
            price: randomPrice,
            geometry: { type: "Point", coordinates: [citySample.longitude, citySample.latitude] },
            author: '63f9e5837f8c99ce9ce0a295',
            images: [
                {
                    url: 'https://res.cloudinary.com/dxxjle3mb/image/upload/v1664882210/YelpCamp/rn5i20oobns9o6vzdemz.jpg',
                    filename: 'YelpCamp/rn5i20oobns9o6vzdemz',

                }
            ]
        });
        await camp.save();
    }


}

seedDB().then(() => mongoose.connection.close());