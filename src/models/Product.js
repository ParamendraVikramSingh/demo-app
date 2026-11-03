const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, required: true, lowercase: true, trim: true },
    stock: { type: Number, default: 0, min: 0 },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

// Full-text search index for /search/suggestions
productSchema.index({ name: 'text', description: 'text' });

module.exports = mongoose.model('Product', productSchema);
