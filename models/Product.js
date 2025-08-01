const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: String,
  description: String,
  price: Number,
  category: String, // Men/Women
  subcategory: String, // watches, perfumes etc
  image: String,
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Product', productSchema);
