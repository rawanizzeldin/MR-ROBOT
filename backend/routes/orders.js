const express = require("express");
const { Order, User, Cart, Product } = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");

const router = express.Router();

/**
 * GET current user orders
 */
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;

    const orders = await Order.find({ userId }).sort({ _id: -1 });

    const result = orders.map(o => ({
      _id: o._id,
      status: o.status,
      total: o.total,
      items: o.items
    }));
   
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch orders" });
  }
});

/**
 * GET all orders (admin)
 */
router.get("/all", requireAuth, requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ _id: -1 });

    const result = await Promise.all(
      orders.map(async (o) => {
        const u = await User.findById(o.userId);

        return {
          _id: o._id,
          userEmail: u?.email || "Unknown User",
          status: o.status || "Pending",
          total: Number(o.total ?? o.total_cents ?? 0),
          items: o.items || []
        };
      })
    );

    res.json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Admin fetch failed" });
  }
});

/**
 * CREATE order
 */
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id || req.user.userId;

    // ✅ FIXED: use user_id (matches Cart schema)
    const cartItems = await Cart.find({ user_id: userId })
      .populate("product_id");

    if (!cartItems.length) {
      return res.status(400).json({ error: "Cart is empty" });
    }

    const total = cartItems.reduce((sum, item) => {
      const price = item.product_id?.price || 0;
      return sum + price * item.quantity;
    }, 0);

    // Logistics & Calculation: Add 10% tax
    const taxRate = 0.1;
    const taxAmount = total * taxRate;
    const finalTotal = total + taxAmount;

    // Asset Optimization: Decrement stock for each item
    for (const item of cartItems) {
      const product = await Product.findById(item.product_id._id);
      if (product) {
        if (product.stock < item.quantity) {
          return res.status(400).json({ error: `Not enough stock for ${product.name}` });
        }
        product.stock -= item.quantity;
        await product.save();
      }
    }

    const newOrder = await Order.create({
      userId, // OK (Order schema)
      items: cartItems.map(i => ({
        productId: i.product_id._id,
        name: i.product_id.name,
        quantity: i.quantity,
        lineTotal: (i.product_id.price || 0) * i.quantity 
      })),
      total: finalTotal,
      status: "Completed"
    });

    // ✅ FIXED: use user_id
    await Cart.deleteMany({ user_id: userId });

    res.status(201).json(newOrder);

  } catch (err) {
    console.error("Order Placement Error:", err);
    res.status(500).json({ error: "Placement failed" });
  }
});
// UPDATE order status (admin)
router.put("/:id/status", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { returnDocument: 'after' } // Use returnDocument: 'after'
    );
    if (!order) return res.status(404).json({ error: "Order not found" });
    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not update status" });
  }
});

module.exports = router;