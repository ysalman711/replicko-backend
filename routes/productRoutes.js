const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');

// ✅ Multer config to store image in Render Disk (/uploads)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, '/uploads'); // Must match Render Disk mount path
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + path.extname(file.originalname);
    cb(null, uniqueName); // e.g. 1691234567890.jpg
  }
});

const upload = multer({ storage });

// ✅ POST: Upload product
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { name, description, price, category, gender } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : '';

    const newProduct = new Product({
      name,
      description,
      price,
      category,
      gender,
      image,
    });

    await newProduct.save();
    res.status(201).json({ message: 'Product uploaded successfully', product: newProduct });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Product upload failed' });
  }
});

// ✅ GET: All products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

module.exports = router;
