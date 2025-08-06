// config/multer.js
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('./cloudinary');

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'replicko_uploads', // This will appear in your Cloudinary dashboard
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

const parser = multer({ storage });

module.exports = parser;
