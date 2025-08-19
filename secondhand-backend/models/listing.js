// models/listing.js
import mongoose from "mongoose";

const listingSchema = new mongoose.Schema({
  photos: [String],                      // array of image URLs
  description: String,
  altText: String,
  price: Number,
  styleTag: String,                      // for personalization
  createdAt: {
    type: Date,
    default: Date.now,
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

const Listing = mongoose.model("Listing", listingSchema);
export default Listing;
