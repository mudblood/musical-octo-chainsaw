// Listing schema
const mongoose = require('mongoose')

const listingSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId, // for personalization later
  photos: [String],                      // array of image URLs
  description: String,
  altText: String,
  price: Number,
  styleTag: String,                      // for personalization
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model('Listing', listingSchema)
