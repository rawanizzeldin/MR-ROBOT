const request = require("supertest");
const mongoose = require("mongoose");
const express = require("express");
const { User, Product, Cart, Order } = require("../db");

// Set secret for testing
process.env.JWT_SECRET = "test-secret";

let app;
let testToken;

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
  app.use("/api/auth", require("../routes/auth"));
  app.use("/api/products", require("../routes/products"));
  app.use("/api/cart", require("../routes/cart"));
  app.use("/api/orders", require("../routes/orders"));

  // Seed one product for testing
  await Product.create({ name: "Test Item", price: 100, description: "Cool item" });
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

  testToken = login.body.token; // Save token for later tests
  expect(login.statusCode).toBe(200);
  expect(typeof testToken).toBe("string");
});

// --- 2. PRODUCT TEST ---
test("Products: Should return a list of products", async () => {
  const res = await request(app).get("/api/products");
  expect(res.statusCode).toBe(200);
  expect(res.body.length).toBeGreaterThan(0);
});

// --- 3. CART TEST ---
test("Cart: Should add an item to the cart", async () => {
  const products = await request(app).get("/api/products");
  const pId = products.body[0].id;

  const res = await request(app)
    .post("/api/cart/items")
    .set("Authorization", `Bearer ${testToken}`)
    .send({ productId: pId, quantity: 2 });

  expect(res.statusCode).toBe(201);
});

// --- 4. ORDER TEST ---
test("Orders: Should place an order and list it", async () => {
  // Place the order
  const place = await request(app)
    .post("/api/orders")
    .set("Authorization", `Bearer ${testToken}`);
  
  expect(place.statusCode).toBe(201);

  // Check the order list
  const list = await request(app)
    .get("/api/orders")
    .set("Authorization", `Bearer ${testToken}`);

  expect(list.statusCode).toBe(200);
  expect(list.body.length).toBeGreaterThan(0);
});