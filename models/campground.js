const mongoose = require("mongoose");
const Review = require("./review");

const Schema = mongoose.Schema;

const CampgroundSchema = new Schema({
    title: String,
    images: [
        {
            url: String,
            filename: String
        }
    ],
    price: Number,
    description: String,
    location: String,
    author : {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    reviews: [{
        type: Schema.Types.ObjectId, 
        ref:"Review" 
    }]
});

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
