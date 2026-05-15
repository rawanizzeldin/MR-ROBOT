const request = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const cookieParser = require("cookie-parser");
const { User, Product, Cart, Order, Review } = require("../db");


// Set secret for testing
process.env.JWT_SECRET = "test-secret";

let app;
let testCookie;
let testProductId;

beforeAll(async () => {
  // Connect to a local test database
  await mongoose.connect("mongodb://127.0.0.1:27017/test_db");

  // Clear all old test data
  await User.deleteMany({});
  await Product.deleteMany({});
  await Cart.deleteMany({});
  await Order.deleteMany({});

  // Setup simple Express app for testing
  app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/auth", require("../routes/auth"));
  app.use("/api/products", require("../routes/products"));
  app.use("/api/cart", require("../routes/cart"));
  app.use("/api/orders", require("../routes/orders"));
  app.use("/api/profile", require("../routes/profile"));
  
  app.post("/logout", (req, res) => {
    res.clearCookie("token");
    res.json({ message: "Logged out" });
  });

  // Seed one product for testing
  const p = await Product.create({ name: "Test Item", price: 100, description: "Cool item", category: "Electronics", stock: 10 }); // Added stock
  testProductId = p._id;
});

afterAll(async () => {
  await mongoose.connection.close();
});

// --- 1. AUTH TEST ---
test("Auth: Should register and login a user", async () => {
  await request(app)
    .post("/api/auth/register")
    .send({ username: "tester", email: "test@test.com", password: "123" });

  const login = await request(app)
    .post("/api/auth/login")
    .send({ email: "test@test.com", password: "123" });

  // Get token from cookie header
  testCookie = login.headers["set-cookie"];
  expect(login.statusCode).toBe(200);
  expect(testCookie).toBeDefined();
});

// --- 2. PRODUCT TEST ---
test("Products: GET /api/products - list products", async () => {
  const res = await request(app).get("/api/products");
  expect(res.statusCode).toBe(200);
  expect(res.body.length).toBeGreaterThan(0);
});

test("Products: GET /api/products/:id - single product", async () => {
  const res = await request(app).get(`/api/products/${testProductId}`);
  expect(res.statusCode).toBe(200);
  expect(res.body.name).toBe("Test Item");
});

// --- 3. CART TEST ---
test("Cart: POST /api/cart/items - add to cart", async () => {
  const res = await request(app)
    .post("/api/cart/items")
    .set("Cookie", testCookie)
    .send({ productId: testProductId, quantity: 2 });

  expect(res.statusCode).toBe(201);
});

test("Cart: GET /api/cart - view cart", async () => {
  const res = await request(app).get("/api/cart").set("Cookie", testCookie);
  expect(res.statusCode).toBe(200);
  expect(res.body.items.length).toBe(1);
});

test("Cart: PUT /api/cart/items/:id - update quantity", async () => {
  const res = await request(app)
    .put(`/api/cart/items/${testProductId}`)
    .set("Cookie", testCookie)
    .send({ quantity: 5 });
  expect(res.statusCode).toBe(200);
});

// --- 4. ORDER TEST ---
test("Orders: POST /api/orders - place order", async () => {
  const place = await request(app).post("/api/orders").set("Cookie", testCookie);
  expect(place.statusCode).toBe(201);
});

test("Orders: GET /api/orders - user orders", async () => {
  const list = await request(app).get("/api/orders").set("Cookie", testCookie);
  expect(list.statusCode).toBe(200);
  expect(list.body.length).toBe(1);
});

// --- 5. PROFILE TEST ---
test("Profile: GET /api/profile", async () => {
  const res = await request(app).get("/api/profile").set("Cookie", testCookie);
  expect(res.statusCode).toBe(200);
  expect(res.body.username).toBe("tester");
});

test("Profile: PUT /api/profile", async () => {
  const res = await request(app)
    .put("/api/profile")
    .set("Cookie", testCookie)
    .send({ username: "tester_updated", profilePictureUrl: "http://test.com/p.jpg" });
  expect(res.statusCode).toBe(200);
});

// --- 6. ADMIN ROUTES ---
test("Admin: Manage Products and Orders", async () => {
  // Make user an admin
  await User.findOneAndUpdate({ email: "test@test.com" }, { is_admin: true });
  
  // Re-login to get admin cookie
  const login = await request(app)
    .post("/api/auth/login")
    .send({ email: "test@test.com", password: "123" });
  const adminCookie = login.headers["set-cookie"];

  // POST Product
  const create = await request(app)
    .post("/api/products")
    .set("Cookie", adminCookie)
    .send({ name: "Admin Item", price: 50, description: "Admin create", category: "Other" });
  expect(create.statusCode).toBe(201);
  const newId = create.body.id;

  // PUT Product
  const update = await request(app)
    .put(`/api/products/${newId}`)
    .set("Cookie", adminCookie)
    .send({ name: "Admin Item Updated" });
  expect(update.statusCode).toBe(200);

  // GET All Orders
  const allOrders = await request(app).get("/api/orders/all").set("Cookie", adminCookie);
  expect(allOrders.statusCode).toBe(200);

  // PUT Order Status
  const orderId = allOrders.body[0]._id;
  const statusUpdate = await request(app)
    .put(`/api/orders/${orderId}/status`)
    .set("Cookie", adminCookie)
    .send({ status: "shipped" });
  expect(statusUpdate.statusCode).toBe(200);

  // DELETE Product
  const del = await request(app).delete(`/api/products/${newId}`).set("Cookie", adminCookie);
  expect(del.statusCode).toBe(200);
});

// --- 7. REVIEW TEST ---
test("Reviews: POST and GET reviews", async () => {
  const post = await request(app)
    .post(`/api/products/${testProductId}/reviews`)
    .set("Cookie", testCookie)
    .send({ rating: 5, comment: "Excellent!" });
  expect(post.statusCode).toBe(201);

  const get = await request(app).get(`/api/products/${testProductId}/reviews`);
  expect(get.statusCode).toBe(200);
  expect(get.body[0].comment).toBe("Excellent!");
});

// --- 8. LOGOUT TEST ---
test("Auth: POST /logout", async () => {
  const res = await request(app).post("/logout").set("Cookie", testCookie);
  expect(res.statusCode).toBe(200);
  expect(res.headers["set-cookie"][0]).toContain("token=;");
});
