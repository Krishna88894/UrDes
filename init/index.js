const mongoose = require("mongoose");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");
const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/UrDes";
main().then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("Failed to connect to MongoDB", err);
});
async function main(){
    await mongoose.connect(MONGO_URI)
}   
const iDb = async() =>{
    await Listing.deleteMany({});
    initdata.data = initdata.data.map((obj) => ({...obj, owner:"69ce868db7ecb12667be0f7b"}));
    await Listing.insertMany(initdata.data);
    console.log("Database initialized with sample data");
}
iDb();