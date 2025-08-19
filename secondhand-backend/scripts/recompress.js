const fs = require('fs')
const path = require('path')
const sharp = require('sharp')

const uploadsDir = path.join(__dirname, '..', 'uploads')
const tempDir = path.join(__dirname, '..', 'temp')

// Ensure temp directory exists
if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir)
}

// ✅ This is the compressImage function
const compressImage = async (inputPath, outputPath) => {
  try {
    await sharp(inputPath)
      .jpeg({ quality: 70 })  // Convert to JPEG and compress
      .toFile(outputPath)
    console.log(`✅ Compressed ${inputPath}`)
  } catch (err) {
    console.warn(`⚠️ Skipping ${inputPath}: ${err.message}`)
  }
}

const processImages = async () => {
  const files = fs.readdirSync(uploadsDir)

  for (const file of files) {
    const inputPath = path.join(uploadsDir, file)

    // Only process image files (optional)
    if (!/\.(jpg|jpeg|png|heic)$/i.test(file)) continue

    const outputPath = path.join(tempDir, file.replace(/\.[^/.]+$/, '.jpg'))

    await compressImage(inputPath, outputPath)
  }

  console.log('✅ Finished processing images')
}

processImages()





