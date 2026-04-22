# MP-UrDes

MP-UrDes is a full-stack travel listing application built with Node.js, Express, MongoDB, and EJS. Users can create, browse, edit, and delete listings, add reviews, sign up or log in, and view map-based location data for each listing.

# Live
https://urdes.onrender.com
## Features

- User authentication with Passport and session-based login
- Create, edit, and delete listings
- Upload listing images to Cloudinary
- Add and remove reviews on listings
- Geocode listing locations with Mapbox
- Flash messages for success and error feedback
- Server-side rendered UI with EJS and Bootstrap-based styling

## Tech Stack

- Runtime: Node.js
- Server: Express
- Database: MongoDB with Mongoose
- Auth: Passport, Passport Local, Passport Local Mongoose
- Views: EJS with ejs-mate layouts
- Uploads: Multer and Cloudinary
- Maps: Mapbox Geocoding and Mapbox GL JS

## Project Structure

- `app.js` - main Express app and server bootstrap
- `controller/` - request handlers for listings, reviews, and users
- `router/` - route definitions
- `models/` - Mongoose models
- `views/` - EJS templates and shared layouts
- `public/` - static CSS, JavaScript, and images
- `init/` - database seed script and sample data
- `utils/` - shared helpers and custom error classes

## Prerequisites

- Node.js 24 or later
- MongoDB database connection string
- Mapbox access token
- Cloudinary credentials for image uploads

## Environment Variables

Create a `.env` file in the project root with the values your deployment needs.

```env
MONGODB_URI=your-mongodb-connection-string
SECRET=your-session-secret
MAP_ACCESS_TOKEN=your-mapbox-access-token
CLOUD_NAME=your-cloudinary-cloud-name
API_KEY=your-cloudinary-api-key
API_SECRET=your-cloudinary-api-secret
```

The app reads `MONGODB_URI` or `MONGO_URI` for MongoDB connections. In production, make sure one of those is set.

## Installation

1. Install dependencies.

```bash
npm install
```

2. Create and configure your `.env` file.

3. Seed the database if you want sample listings.

```bash
npm run seed
```

4. Start the server.

```bash
node app.js
```

The application listens on port `8080` by default, or on the value of `PORT` if it is set.

## Available Scripts

- `npm run seed` - populate the database with sample listings
- `npm test` - placeholder script; no automated tests are configured yet

## Deployment Notes

- Use `MONGODB_URI` or `MONGO_URI` in hosted environments instead of a local MongoDB URL.
- Listings that fail to load on deployment are often caused by a missing production database URI.
- Map rendering on listing details requires `MAP_ACCESS_TOKEN` and the shared layout to load the map script after Mapbox GL JS.

## Data Model Overview

- Listings store title, description, price, location, country, image, owner, reviews, and geometry.
- Reviews store rating, comments, author, and creation time.
- Users are managed through Passport Local Mongoose.

## Notes

- Listing images are stored in Cloudinary.
- Listing coordinates are resolved with Mapbox geocoding.
- Sessions are persisted with MongoDB-backed session storage.
