const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');

require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();

// ✅ Console Checks
console.log('✅ MONGO_URI:', process.env.MONGO_URI ? 'Loaded' : 'Missing');
console.log('✅ ADMIN_EMAIL:', process.env.ADMIN_EMAIL);
console.log('✅ JWT_SECRET:', process.env.JWT_SECRET ? 'Loaded' : 'Missing');

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Ensure uploads folder exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
  console.log('📂 uploads folder created');
}
app.use('/uploads', express.static(uploadDir));

// ✅ Serve static frontend files (optional)
app.use('/frontend', express.static(path.join(__dirname, 'frontend')));

// ✅ Health Check Route
app.get('/', (req, res) => {
  res.send('✅ Replicko backend is online and responding');
});

// ✅ Admin Login
app.post('/api/admin/login', (req, res) => {
  const { email, password } = req.body;

  if (
    email === process.env.ADMIN_EMAIL &&
    password === process.env.ADMIN_PASSWORD
  ) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: '2h',
    });
    res.json({ token });
  } else {
    res.status(401).json({ message: 'Invalid credentials' });
  }
});

// ✅ Product Routes
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

// ✅ MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch((err) => console.log('❌ MongoDB error:', err));

// ✅ Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server started on http://0.0.0.0:${PORT}`);
});
