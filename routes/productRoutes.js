const express = require('express');
const router = express.Router();
const multer = require('multer');
const Product = require('../models/Product');
const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// ✅ Multer setup (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Get All Products
router.get('/all', async (req, res) => {
  try {
    const products = await Product.find().sort({ date: -1 });
    res.json(products);
  } catch (err) {
    console.error('❌ Error fetching products:', err);
    res.status(500).json({ message: 'Server error while fetching products.' });
  }
});

// ✅ Upload New Product (with Cloudinary)
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, category, subcategory } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Image not uploaded' });
    }

    // Upload to Cloudinary
    const streamUpload = (req) => {
      return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream((error, result) => {
          if (result) {
            resolve(result);
          } else {
            reject(error);
          }
        });
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    };

    const result = await streamUpload(req);

    // Save product with Cloudinary URL
    const newProduct = new Product({
      title,
      description,
      price,
      category,
      subcategory,
      image: result.secure_url, // ✅ Cloudinary URL
    });

    await newProduct.save();
    res.json({ message: 'Product uploaded successfully!' });
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ message: 'Upload failed. Try again later.' });
  }
});

module.exports = router;
