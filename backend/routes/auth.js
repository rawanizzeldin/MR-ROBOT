const express = require("express");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { User } = require("../db");

const router = express.Router();


// --- REGISTER ---
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;

  // Validate fields
  if (!username || !email || !password) {
    return res.status(400).json({
      error: "Please fill all fields"
    });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        error: "Email already exists"
      });
    }

    // Generate salt
    const salt = await bcrypt.genSalt(10);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const newUser = await User.create({
      username,
      email,
      password_hash: hashedPassword
    });

    res.status(201).json({
      message: "Success! You can now log in.",
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email
      }
    });

  } catch (err) {
    console.error("Registration Error:", err);

    res.status(500).json({
      error: "Registration failed"
    });
  }
});


// --- LOGIN ---
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Validate fields
  if (!email || !password) {
    return res.status(400).json({
      error: "Please provide email and password"
    });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });

    // Check if user exists
    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    // Compare entered password with hashed password
    const isMatch = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid email or password"
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        is_admin: user.is_admin
      },
      process.env.JWT_SECRET || "your_fallback_secret",
      {
        expiresIn: "1d"
      }
    );

    // Send response
    res.cookie("token", token, {
  httpOnly: true,
  secure: false, // true in production with HTTPS
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000
});

res.json({ user });

  } catch (err) {
    console.error("Login Error:", err);

    res.status(500).json({
      error: "Login failed"
    });
  }
});

module.exports = router;