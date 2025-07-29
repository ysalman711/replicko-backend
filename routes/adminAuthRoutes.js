const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

const router = express.Router();

// Register admin (only once for setup)
router.post("/register", async (req, res) => {
  try {
    const { email, password } = req.body;
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ msg: "Admin already exists" });

    const hashed = await bcrypt.hash(password, 10);
    const newAdmin = new Admin({ email, password: hashed });
    await newAdmin.save();

    res.json({ msg: "Admin created successfully" });
  } catch (err) {
    res.status(500).json({ msg: "Server error", error: err });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ msg: "Invalid credentials" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign({ adminId: admin._id }, process.env.JWT_SECRET, { expiresIn: "2d" });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: "Login failed", error: err });
  }
});

module.exports = router;
