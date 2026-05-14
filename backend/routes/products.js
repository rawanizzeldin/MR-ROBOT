const express = require("express");
const { Product } = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

// 1. Get all products (Public)
router.get("/", async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;

    // Find products and sort by newest first
    const products = await Product.find(filter).sort({ _id: -1 });
    
    // Map data so the frontend gets "id" instead of "_id"
    const result = products.map((p) => ({
      id:          p._id,
      name:        p.name,
      description: p.description,
      price:       p.price,
      category:    p.category,
      stock:       p.stock,
      imageUrl:    p.image // Matches your db.js schema
    }));
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch products" });
  }
});

// 2. Get single product (Public)
router.get("/:id", async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ error: "Product not found" });

    res.json({
      id:          p._id,
      name:        p.name,
      description: p.description,
      price:       p.price,
      imageUrl:    p.image
    });
  } catch (err) {
    res.status(404).json({ error: "Invalid product ID" });
  }
});

// 3. Add product (Admin only)
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  const { name, description, price, category, stock, imageUrl } = req.body;

  // Simple student-style validation
  if (!name || !price) {
    return res.status(400).json({ error: "Name and price are required" });
  }

  try {
    const product = await Product.create({
      name,
      description,
      price,
      category,
      stock,
      image: imageUrl // Matches your db.js schema
    });
    res.status(201).json({ id: product._id, message: "Product created!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to create product" });
  }
});

// 4. Edit product (Admin only)
router.put("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      req.body, // Directly use req.body for simplicity
      { new: true }
    );
    if (!updated) return res.status(404).json({ error: "Product not found" });
    res.json({ ok: true, message: "Product updated!" });
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// 5. Delete product (Admin only)
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Product not found" });
    res.json({ ok: true, message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;