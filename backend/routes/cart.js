const express = require("express");
const { Cart, Product } = require("../db"); 
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// 1. View Cart
router.get("/", requireAuth, async (req, res) => {
  try {
    // Find items using user_id (matching your schema)
    const cartItems = await Cart.find({ user_id: req.user.id }).populate('product_id');

    // Format the items for the frontend
    const items = cartItems.map((item) => {
      const p = item.product_id;
      if (!p) return null; 

      return {
        productId: p._id,
        name:      p.name,
        price:     p.price,
        // Updated to p.image to match your Product collection key
        imageUrl:  p.image, 
        quantity:  item.quantity,
        total:     p.price * item.quantity
      };
    }).filter(i => i !== null);

    const grandTotal = items.reduce((sum, i) => sum + i.total, 0);
    
    res.json({ items, grandTotal });
  } catch (err) {
    console.error("Cart Load Error:", err);
    res.status(500).json({ error: "Could not load cart" });
  }
});

// 2. Add item to cart
router.post("/items", requireAuth, async (req, res) => {
  const { productId, quantity } = req.body;

  try {
    // Use user_id and product_id to match your new CartSchema
    let item = await Cart.findOne({ user_id: req.user.id, product_id: productId });

    if (item) {
      item.quantity += (Number(quantity) || 1);
      await item.save();
    } else {
      await Cart.create({
        user_id: req.user.id,
        product_id: productId,
        quantity: Number(quantity) || 1
      });
    }
    res.status(201).json({ message: "Added to cart" });
  } catch (err) {
    console.error("Cart Add Error:", err);
    res.status(500).json({ error: "Could not add item" });
  }
});
router.put("/items/:productId", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id;
    const { quantity } = req.body;

    const item = await Cart.findOneAndUpdate(
      { user_id: userId, product_id: req.params.productId },
      { quantity },
      { new: true }
    );

    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ error: "Could not update quantity" });
  }
});
// 3. Remove item from cart
router.delete("/items/:productId", requireAuth, async (req, res) => {
  try {
    // Use product_id in the filter to match schema
    await Cart.deleteOne({ user_id: req.user.id, product_id: req.params.productId });
    res.json({ message: "Item removed" });
  } catch (err) {
    res.status(500).json({ error: "Delete failed" });
  }
});

module.exports = router;