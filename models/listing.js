const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const FALLBACK_IMAGE = "https://www.elegantthemes.com/blog/wp-content/uploads/2020/08/000-http-error-codes.png";
const Review = require("./review.js");

const ListingSchema = new Schema({
    title: {
        type : String, 
        required : true
    }, 
    description : String, 
    price : Number,
    location : String,
    image: {
        url: String,
        filename: String
    },
    country : String,
    reviews : [{
    type : Schema.Types.ObjectId,
    ref : "Review"
    }
],
    owner :{
        type: Schema.Types.ObjectId,
        ref: "User"
        },
    geometry: {
        type: {
            type: String,
            "enum": ["Point"],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    }
});


ListingSchema.post("findOneAndDelete", async( listing) =>{
    if(listing){
        await Review.deleteMany({ _id: { $in: listing.reviews } });
    }
});
module.exports =mongoose.model("Listing", ListingSchema);
