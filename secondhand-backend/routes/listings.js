console.log('✅ listings.js route loaded')

// routes/listings.js
const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')
const Listing = require('../models/listing')
const router = express.Router()
const auth = require('../middleware/auth')

// Public feed route
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 }).limit(100)
    res.json(listings)
  } catch (err) {
    console.error('Failed to get feed listings:', err)
    res.status(500).json({ error: 'Failed to fetch listings' })
  }
})

// Save raw uploads temporarily to /temp folder
const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'temp/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  }
})
const upload = multer({ storage: tempStorage })


// POST /listings - Upload up to 24 images and save listing
router.post('/', upload.array('photos', 24), async (req, res) => {
  try {
    const { description, price, location } = req.body  
    const photos = []

    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase()
      const inputPath = file.path
      
      // Generate safe JPG filename
      const baseName = file.originalname.replace(/\.[^/.]+$/, '')
      const outputName = `${Date.now()}-${baseName}.jpg`
      const outputPath = path.join('uploads', outputName)

      // Convert + compress
      await sharp(inputPath)
        .rotate() // auto-correct orientation using exif
        .resize({ width: 1024 }) // optional resize for performance
        .jpeg({ quality: 70 })
        .toFile(outputPath)

      // Clean up temp file
      fs.unlinkSync(inputPath)

      // Save relative path for frontend
      photos.push(`/uploads/${outputName}`)
    }

    const desc = description.trim()

    const listing = new Listing({
      photos,
      description: desc,
      altText: desc,
      price: price ? parseFloat(price) : null,   // ✅ handle price or null
      createdAt: new Date(),
      user: req.userId // associate with logged-in user
    })

    await listing.save()
    res.json({ success: true, listing })
  } catch (err) {
    console.error('❌ Upload error:', err)
    res.status(500).json({ success: false, message: 'Upload failed' })
  }
})

// ✅ GET /admin/listings for dashboard
router.get('/admin/listings', async (req, res) => {
  try {
    const listings = await Listing.find()
      .sort({ createdAt: -1 })
      .populate('user', 'email')  // ✅ bring in user email only

    res.json(listings)
  } catch (err) {
    console.error('❌ Failed to fetch admin listings:', err)
    res.status(500).json({ message: 'Server error' })
  }
})

// DELETE /admin/listings/:id – delete a listing
router.delete('/admin/listings/:id', async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id)
    res.json({ message: 'Listing deleted' })
  } catch (err) {
    console.error('Delete error:', err)
    res.status(500).json({ message: 'Error deleting listing' })
  }
})

module.exports = router
