const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ReviewSchema = new Schema({
    comments : String, 
    rating : {
        type : Number, 
        min : 1, max : 5
    },
    createdAt : {
        type: Date,
        default : Date.now
    }, 
    name :String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }
});
module.exports = mongoose.model("Review", ReviewSchema);