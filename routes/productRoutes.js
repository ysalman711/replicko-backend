import express from "express";
import multer from "multer";
import Product from "../models/Product.js";

const router = express.Router();

// Multer config for local uploads (Cloudinary can also be integrated here if needed)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  }
});

const upload = multer({ storage });

// Create product (original POST route)
router.post("/", upload.single("image"), async (req, res) => {
  try {
    const { title, price, category, subcategory, imageUrl } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ message: "Title, price, and category are required" });
    }

    const newProduct = new Product({
      title,
      price,
      category,
      subcategory,
      image: imageUrl || (req.file ? `/uploads/${req.file.filename}` : null)
    });

    await newProduct.save();
    res.status(201).json({ message: "Product created successfully", product: newProduct });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Create product (upload route for admin.html compatibility)
router.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { title, price, category, subcategory, imageUrl } = req.body;

    if (!title || !price || !category) {
      return res.status(400).json({ message: "Title, price, and category are required" });
    }

    const newProduct = new Product({
      title,
      price,
      category,
      subcategory,
      image: imageUrl || (req.file ? `/uploads/${req.file.filename}` : null)
    });

    await newProduct.save();
    res.status(201).json({ message: "Product uploaded successfully", product: newProduct });
  } catch (error) {
    console.error("Error uploading product:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;
