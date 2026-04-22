if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const mongoose = require("mongoose");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const initdata = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || "mongodb://127.0.0.1:27017/UrDes";
const mapToken = process.env.MAP_ACCESS_TOKEN;
const geocodingClient = mapToken ? mbxGeocoding({ accessToken: mapToken }) : null;

// Fallback to Delhi coordinates if geocoding is unavailable for any listing.
const DEFAULT_GEOMETRY = {
    type: "Point",
    coordinates: [77.1025, 28.7041],
};

async function getGeometry(location, country) {
    if (!geocodingClient) return DEFAULT_GEOMETRY;

    try {
        const query = [location, country].filter(Boolean).join(", ");
        const geoRes = await geocodingClient
            .forwardGeocode({
                query,
                limit: 1,
            })
            .send();

        const feature = geoRes.body.features[0];
        return feature?.geometry || DEFAULT_GEOMETRY;
    } catch (err) {
        return DEFAULT_GEOMETRY;
    }
}

async function buildSeedListings() {
    const seedOwner = process.env.SEED_OWNER_ID || "69ce868db7ecb12667be0f7b";
    const sourceListings = initdata.data || [];

    return Promise.all(
        sourceListings.map(async (obj) => ({
            ...obj,
            owner: obj.owner || seedOwner,
            geometry: await getGeometry(obj.location, obj.country),
        }))
    );
}

async function initDb() {
    if (!MONGO_URI) {
        throw new Error("Missing MongoDB connection string. Set MONGODB_URI in .env");
    }

    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const listings = await buildSeedListings();
    await Listing.deleteMany({});
    await Listing.insertMany(listings);
    console.log(`Database initialized with ${listings.length} sample listings`);
}

initDb()
    .then(async () => {
        await mongoose.connection.close();
        console.log("Connection closed");
    })
    .catch(async (err) => {
        console.error("Failed to initialize database:", err.message);
        try {
            await mongoose.connection.close();
        } catch (closeErr) {
            // ignore close errors
        }
        process.exit(1);
    });
//hello