const mongoose = require("mongoose");
const Review = require("./review");

const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
})

//It is derived from the data we already have so we make a virtual property
ImageSchema.virtual("thumbnail").get(function() {
    return this.url.replace("/upload","/upload/w_200");
}
)

const opts = {toJSON: { virtuals: true}};

const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    price: Number,
    description: String,
    geometry: {
        type: {
            type: String,
            enum: ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    location: String,
    author : {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [{
        type: Schema.Types.ObjectId, 
        ref:"Review" 
    }]
},opts);

CampgroundSchema.virtual('properties.popUpMarkup').get(function() {
    return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0,50)}...</p>`;
})

//search which middleware triggers
CampgroundSchema.post("findOneAndDelete", async function (doc) {
    if(doc){
        console.log("entro")
        await Review.deleteMany({ 
                        _id: { 
                            $in: doc.reviews
                        }})
    }
})

module.exports = mongoose.model("Campground", CampgroundSchema);
