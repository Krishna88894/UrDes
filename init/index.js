const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");
main().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Failed to connect to MongoDB", err);
});
async function main(){
    await mongoose.connect("mongodb://127.0.0.1:27017/UrDes")
}   
const iDb = async() =>{
    await Listing.deleteMany({});
    await Listing.insertMany(initdata.data);
    console.log("Database initialized with sample data");
}
iDb();