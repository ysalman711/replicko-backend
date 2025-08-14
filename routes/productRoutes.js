// routes/productRoutes.js
const express = require("express");
const multer = require("multer");
const { v2: cloudinary } = require("cloudinary");
const streamifier = require("streamifier");
const Product = require("../models/Product");

const router = express.Router();

// ── Multer: memory storage + limits + filter ───────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB (change if needed)
  fileFilter: (req, file, cb) => {
    const ok =
      file.mimetype.startsWith("image/") ||
      file.mimetype.startsWith("video/");
    if (!ok) return cb(new Error("Only images or videos are allowed"));
    cb(null, true);
  },
});

// ── Cloudinary config (env must be set on Render) ─────────────────────────────
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ── POST /api/products/add ────────────────────────────────────────────────────
router.post("/add", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Image/Video file is required" });
    }

    // Upload to Cloudinary using a stream (supports large buffers)
    const streamUpload = () =>
      new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: "replicko",
            resource_type: "auto", // ← IMPORTANT: allows image or video
          },
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

    const result = await streamUpload();

    // Save product in MongoDB
    const newProduct = new Product({
      title: req.body.title,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      subcategory: req.body.subcategory,
      image: result.secure_url,
    });

    await newProduct.save();
    return res.json({
      success: true,
      message: "Product added successfully!",
      product: newProduct,
    });
  } catch (err) {
    console.error("❌ Error adding product:", err);
    return res.status(500).json({
      success: false,
      message: "Upload failed",
      error: err?.message || err,
    });
  }
});

// ── GET /api/products ─────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const products = await Product.find().sort({ date: -1 });
    res.json(products);
  } catch (err) {
    console.error("❌ Error fetching products:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
