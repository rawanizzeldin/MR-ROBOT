const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import the model

// [CREATE] - Register
router.post('/register', async (req, res) => {
  try {
    // Simply pass req.body directly to create the user
    await User.create(req.body);
    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    res.status(400).json({ error: "Registration failed" });
  }
});

// [UPDATE] - Update (e.g., set is_admin: true)
router.put('/update/:id', async (req, res) => {
  try {
    // findByIdAndUpdate is the fastest way to handle updates
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: "Update failed" });
  }
});

// [READ] - Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch users" });
  }
});

module.exports = router;