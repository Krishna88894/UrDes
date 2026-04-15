const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const FALLBACK_IMAGE = "https://www.elegantthemes.com/blog/wp-content/uploads/2020/08/000-http-error-codes.png";

const ListingSchema = new Schema({
    title: {
        type : String, 
        required : true
    }, 
    description : String, 
    price : Number,
    location : String,
    image: {
        url: {
            type: String,
            default: FALLBACK_IMAGE,
            set: (v) => (v === "" ? FALLBACK_IMAGE : v),
        },
    },
    country : String,
    reviews : [{
    type : Schema.Types.ObjectId,
    ref : "Review"
    }]
});
module.exports =mongoose.model("Listing", ListingSchema);
