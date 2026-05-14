const jwt = require("jsonwebtoken");

// Check if the user is logged in
function requireAuth(req, res, next) {
  const token = req.cookies.token; // Grabs just the token part
 
  if (!token) return res.status(401).json({ error: "Please log in first" });

  try {
   req.user = jwt.verify(token, process.env.JWT_SECRET || "your_fallback_secret");
    next();
  } catch {
    res.status(401).json({ error: "Session expired, login again" });
  }
}

// Check if the user is an admin
function requireAdmin(req, res, next) {
  // We use is_admin to match your MongoDB field exactly
  if (!req.user?.is_admin) {
    return res.status(403).json({ error: "Admins only!" });
  }
  next();
}

module.exports = { requireAuth, requireAdmin };