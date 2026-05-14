const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password_hash: { type: String, required: true },
  is_admin: { type: Boolean, default: false }
});

// Automatically hash password before saving to the database


module.exports = mongoose.model('User', userSchema);