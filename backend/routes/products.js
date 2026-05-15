const express = require("express");
const { Product } = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();
const upload = require("../middleware/upload");
// 1. Get all products (Public)
/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 */
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
      image:    p.image // Matches your db.js schema
    }));
    
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: "Could not fetch products" });
  }
});

// 2. Get single product (Public)
/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 */
router.get("/:id", async (req, res) => {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ error: "Product not found" });

    res.json({
      id:          p._id,
      name:        p.name,
      description: p.description,
      price:       p.price,
      image:    p.image
    });
  } catch (err) {
    res.status(404).json({ error: "Invalid product ID" });
  }
});

// 3. Add product (Admin only)
/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Add product (Admin)
 *     tags: [Products]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               description: { type: string }
 *               price: { type: number }
 *               category: { type: string }
 *               stock: { type: number }
 *               image: { type: string, format: binary }
 */
router.post("/", requireAuth, requireAdmin, upload.single("image"), async (req, res) => {
  const { name, description, price, category, stock } = req.body;

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
      image: req.file ? req.file.path : null  // Cloudinary gives you the URL in req.file.path
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