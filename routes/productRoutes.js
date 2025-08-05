const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Product = require('../models/Product');

// ✅ Multer Storage Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname.replace(/\s+/g, '');
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

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

// ✅ Upload New Product
router.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const { title, description, price, category, subcategory } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Image not uploaded' });
    }

    const newProduct = new Product({
      title,
      description,
      price,
      category,
      subcategory,
      image: req.file.filename
    });

    await newProduct.save();
    res.json({ message: 'Product uploaded successfully!' });
  } catch (err) {
    console.error('❌ Upload error:', err);
    res.status(500).json({ message: 'Upload failed. Try again later.' });
  }
});

module.exports = router;
