// routes/listings.js
const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const sharp = require('sharp')
const Listing = require('../models/listing')
const router = express.Router()

// Save raw uploads temporarily to /temp folder
const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'temp/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  }
})
const tempUpload = multer({ storage: tempStorage })

// Save compressed uploads to /uploads folder
const uploadStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`
    cb(null, uniqueName)
  }
})
const upload = multer({ storage: uploadStorage })

router.post('/', upload.array('photos'), async (req, res) => {
  try {
    const { message } = req.body
    const photos = []

    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase()
      const inputPath = file.path

      // Use .jpg extension for output
      const outputName = `${Date.now()}-${file.originalname.replace(/\.[^/.]+$/, '')}.jpg`
      const outputPath = path.join('uploads', outputName)

      if (ext === '.heic') {
        // HEIC to JPG conversion using sharp
        await sharp(inputPath)
          .jpeg({ quality: 70 }) // compress and convert
          .toFile(outputPath)
      } else {
        // Compress JPG/PNG
        await sharp(inputPath)
          .resize({ width: 1024 }) // optional resize
          .jpeg({ quality: 70 })
          .toFile(outputPath)
      }

      // Clean up temp file
      fs.unlinkSync(inputPath)

      photos.push(`/uploads/${outputName}`)
    }

    // Parse message
    const priceMatch = message.match(/\$\s*([\d.]+)/)
    const price = priceMatch ? parseFloat(priceMatch[1]) : null
    const description = message.replace(/\$\s*[\d.]+/, '').trim()

    const listing = new Listing({
      photos,
      description,
      price,
      altText: description,
      createdAt: new Date(),
    })

    await listing.save()
    res.json({ success: true, listing })
  } catch (err) {
    console.error('❌ Upload error:', err)
    res.status(500).json({ success: false, message: 'Upload failed' })
  }
})

// POST /listings
router.post('/', upload.array('photos'), async (req, res) => {
  try {
    const { message } = req.body
    const photos = req.files.map(f => `/uploads/${f.filename}`)

    // Parse message
    const priceMatch = message.match(/\$\s*([\d.]+)/)
    const price = priceMatch ? parseFloat(priceMatch[1]) : null
    const description = message.replace(/\$\s*[\d.]+/, '').trim()

    const listing = new Listing({
      photos,
      description,
      price,
      altText: description, // for accessibility
      createdAt: new Date(),
    })

    await listing.save()
    res.json({ success: true, listing })
  } catch (err) {
    console.error(err)
    res.status(500).json({ success: false, message: 'Error saving listing.' })
  }
})

// GET /listings - fetch all listings, newest first
router.get('/', async (req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    console.error('Error fetching listings:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router
