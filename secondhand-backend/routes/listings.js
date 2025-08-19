// routes/listings.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import sharp from "sharp";
import Listing from "../models/listing.js"; // ES module import
import auth from "../routes/auth.js";   // make sure auth is ES module

const router = express.Router();

console.log("✅ listings.js route loaded");

// Public feed route
router.get("/", async (req, res) => {
  try {
    const listings = await Listing.find().sort({ createdAt: -1 }).limit(100);
    res.json(listings);
  } catch (err) {
    console.error("Failed to get feed listings:", err);
    res.status(500).json({ error: "Failed to fetch listings" });
  }
});

// Multer storage for temporary uploads
const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "temp/"),
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${file.originalname}`;
    cb(null, uniqueName);
  },
});
const upload = multer({ storage: tempStorage });

// POST /listings - Upload images and save listing
router.post("/", upload.array("photos", 24), async (req, res) => {
  try {
    const { description, price, location } = req.body;
    const photos = [];

    for (const file of req.files) {
      const baseName = file.originalname.replace(/\.[^/.]+$/, "");
      const outputName = `${Date.now()}-${baseName}.jpg`;
      const outputPath = path.join("uploads", outputName);

      await sharp(file.path)
        .rotate()
        .resize({ width: 1024 })
        .jpeg({ quality: 70 })
        .toFile(outputPath);

      fs.unlinkSync(file.path);
      photos.push(`/uploads/${outputName}`);
    }

    const listing = new Listing({
      photos,
      description: description.trim(),
      altText: description.trim(),
      price: price ? parseFloat(price) : null,
      createdAt: new Date(),
      user: req.userId, // from auth middleware
    });

    await listing.save();
    res.json({ success: true, listing });
  } catch (err) {
    console.error("❌ Upload error:", err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
});

// GET /admin/listings - admin dashboard
router.get("/admin/listings", async (req, res) => {
  try {
    const listings = await Listing.find()
      .sort({ createdAt: -1 })
      .populate("user", "email");
    res.json(listings);
  } catch (err) {
    console.error("❌ Failed to fetch admin listings:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /admin/listings/:id
router.delete("/admin/listings/:id", async (req, res) => {
  try {
    await Listing.findByIdAndDelete(req.params.id);
    res.json({ message: "Listing deleted" });
  } catch (err) {
    console.error("Delete error:", err);
    res.status(500).json({ message: "Error deleting listing" });
  }
});

export default router;
