const express = require("express");
const { User } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Get the logged-in user's profile info
router.get("/", requireAuth, async (req, res) => {
  try {
    // Find the user by the ID stored in the JWT token
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Send back only the necessary information 
    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      is_admin: user.is_admin,
      profile_picture_url: user.profile_picture_url || "" 
    });
  } catch (err) {
    res.status(500).json({ error: "Could not load profile" });
  }
});

// Update the logged-in user's profile info
router.put("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { username, profilePictureUrl } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { username, profile_picture_url: profilePictureUrl }, // Match schema field name
      { returnDocument: 'after', runValidators: true } // Use returnDocument: 'after'
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ message: "Profile updated successfully!", user: { id: updatedUser._id, username: updatedUser.username, email: updatedUser.email, is_admin: updatedUser.is_admin, profile_picture_url: updatedUser.profile_picture_url } });
  } catch (err) {
    console.error("Profile Update Error:", err);
    res.status(500).json({ error: "Could not update profile" });
  }
});

module.exports = router;