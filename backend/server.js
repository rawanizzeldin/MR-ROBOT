require('dotenv').config();
// Should print your key
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const cookieParser = require("cookie-parser");

app.use(cookieParser());
// Middlewares
// server.js — replace app.use(cors()) with:
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());

// Database Connection
// Serve static files from the 'uploads' directory
app.use('/uploads', express.static('uploads'));
const dbURI = process.env.MONGO_URI;
mongoose.connect(dbURI)
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log('Database Error:', err));

// Route Handlers
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/profile', require('./routes/profile'));

// Basic Health Check
app.get('/', (req, res) => res.send('API is running...'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
app.post("/logout", (req, res) => {

  res.clearCookie("token");

  res.json({
    message: "Logged out"
  });
});