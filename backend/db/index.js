const mongoose = require('mongoose');

// --- 1. SCHEMAS ---

const UserSchema = new mongoose.Schema({
  username:           String,
  email:              { type: String, unique: true },
  password_hash:      String, // Must match Compass key
  is_admin:           { type: Boolean, default: false }, // Must match Compass key
  profile_picture_url: String, // Keep consistent with underscore naming
});

const ProductSchema = new mongoose.Schema({
  name:        { type: String, required: true },
  description: { type: String, required: true },
  price:       { type: Number, required: true },
  category:    { type: String, default: "Other" },
  stock:       { type: Number, default: 0 }, // Default to 0 instead of null for better math logic
  image:       { type: String, default: null } // Matches your Compass database perfectly
});

const CartSchema = new mongoose.Schema({
  user_id:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity:   { type: Number, default: 1 }
});

const OrderSchema = new mongoose.Schema({
  userId:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status:  { type: String, default: 'pending' },
  total:   { type: Number, default: 0 },
  items: [{
    productId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name:       String,
    quantity:   Number,
    lineTotal:  Number,
  }],
}, { timestamps: true });

// --- 2. MODELS & EXPORTS ---
module.exports = {
  User:    mongoose.models.User    || mongoose.model('User',    UserSchema),
  Product: mongoose.models.Product || mongoose.model('Product', ProductSchema),
  Cart:    mongoose.models.Cart    || mongoose.model('Cart',    CartSchema),
  Order:   mongoose.models.Order   || mongoose.model('Order',   OrderSchema),
};