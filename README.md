<div align="center">

```
███╗   ███╗██████╗       ██████╗  ██████╗ ██████╗  ██████╗ ████████╗
████╗ ████║██╔══██╗      ██╔══██╗██╔═══██╗██╔══██╗██╔═══██╗╚══██╔══╝
██╔████╔██║██████╔╝      ██████╔╝██║   ██║██████╔╝██║   ██║   ██║   
██║╚██╔╝██║██╔══██╗      ██╔══██╗██║   ██║██╔══██╗██║   ██║   ██║   
██║ ╚═╝ ██║██║  ██║      ██║  ██║╚██████╔╝██████╔╝╚██████╔╝   ██║   
╚═╝     ╚═╝╚═╝  ╚═╝      ╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝   ╚═╝   
```

### 🛒 Full-Stack E-Commerce Platform

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=JSON%20web%20tokens&logoColor=white)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Database Schema](#-database-schema)
- [Authentication Flow](#-authentication-flow)
- [Documentation](#-documentation)

---

## 🤖 About

**MR-ROBOT** is a full-stack e-commerce web application that lets users browse a product catalogue, manage a shopping cart, place orders, and leave product reviews. Administrators get a dedicated panel to manage inventory and monitor all orders in real time.

The project is built as a decoupled architecture — a **React SPA** on the frontend communicates with a **Node.js/Express REST API** on the backend, backed by **MongoDB** for data and **Cloudinary** for image storage.

---

## ✨ Features

### 👤 Customer
- Browse and filter products by category (Electronics, Accessories, Phones, Desktops, Other)
- View full product details and customer reviews
- Add products to cart, adjust quantities, remove items
- Place orders and view full order history
- Submit star ratings and written reviews for products

### 🔐 Authentication
- Register with username, email, and password (Yup validation)
- Login with JWT stored in an **HTTP-only cookie** (XSS-safe)
- Persistent sessions across tabs and page refreshes
- Protected routes redirect unauthenticated users to login

### 🛠️ Admin
- Add, edit, and delete products
- Upload product images (JPEG / PNG / WebP, max 5 MB) — hosted on Cloudinary
- View all customer orders with user email and totals
- Update order statuses: `pending → processing → shipped → completed / cancelled`
- Low-stock alerts for products with fewer than 5 units remaining

---

## 🧰 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, React Router v6, Formik, Yup, Axios |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Auth | JSON Web Tokens (HTTP-only cookies) |
| File Storage | Cloudinary (via Multer) |
| Testing | Jest, Supertest |
| Validation | Yup (client), Mongoose schemas (server) |

---

## 📁 Project Structure

```
MR-ROBOT/
├── frontend/
│   └── src/
│       ├── api/
│       │   └── client.js           # Axios instance (withCredentials)
│       ├── auth/
│       │   └── AuthContext.js      # Global auth state (React Context)
│       ├── pages/
│       │   ├── Register.js         # Registration form (Formik + Yup)
│       │   ├── Login.js            # Login form
│       │   ├── Products.js         # Product catalogue with category filter
│       │   ├── ProductDetail.js    # Single product + reviews
│       │   ├── Cart.js             # Shopping cart
│       │   ├── Orders.js           # User order history
│       │   ├── Admindashboard.js   # Admin: orders + low-stock alerts
│       │   └── AdminProducts.js    # Admin: product CRUD + image upload
│       └── styles.css
│
└── backend/
    ├── middleware/
    │   ├── auth.js                 # requireAuth, requireAdmin
    │   └── upload.js               # Multer + Cloudinary storage
    ├── models/
    │   └── user.js                 # Mongoose User schema
    ├── routes/
    │   ├── userRoutes.js           # /api/users
    │   ├── products.js             # /api/products
    │   ├── cart.js                 # /api/cart
    │   └── orders.js               # /api/orders
    ├── db.js                       # MongoDB connection + all models
    └── server.js                   # Express app entry point
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Cloudinary account

### 1 — Clone the repository

```bash
git clone https://github.com/your-username/mr-robot.git
cd mr-robot
```

### 2 — Install backend dependencies

```bash
cd backend
npm install
```

### 3 — Install frontend dependencies

```bash
cd ../frontend
npm install
```

### 4 — Configure environment variables

Create a `.env` file inside `/backend` (see [Environment Variables](#-environment-variables) below).

### 5 — Run the development servers

**Backend** (from `/backend`):
```bash
npm run dev
# Runs on http://localhost:5000
```

**Frontend** (from `/frontend`):
```bash
npm start
# Runs on http://localhost:3000
```

### 6 — Run tests

```bash
cd backend
npm test
```

---

## 🔑 Environment Variables

Create a `.env` file in the `/backend` directory:

```env
# Server
PORT=5000

# MongoDB
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/mr-robot

# JSON Web Token
JWT_SECRET=your_super_secret_key_here

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> ⚠️ Never commit your `.env` file. Add it to `.gitignore`.

---

## 📡 API Reference

All endpoints are prefixed with `/api`. Authentication uses HTTP-only JWT cookies — no `Authorization` header needed.

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register a new user |
| `POST` | `/api/auth/login` | Public | Login and receive JWT cookie |
| `POST` | `/api/logout` | Authenticated | Clear JWT cookie |
| `GET` | `/api/auth/me` | Authenticated | Get current user profile |

### Products

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/products` | Public | Get all products (optional `?category=`) |
| `GET` | `/api/products/:id` | Public | Get single product |
| `POST` | `/api/products` | Admin | Create product (multipart/form-data) |
| `PUT` | `/api/products/:id` | Admin | Update product |
| `DELETE` | `/api/products/:id` | Admin | Delete product |
| `GET` | `/api/products/:id/reviews` | Public | Get product reviews |
| `POST` | `/api/products/:id/reviews` | Authenticated | Post a review |

### Cart

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/cart` | Authenticated | View cart with grand total |
| `POST` | `/api/cart/items` | Authenticated | Add item to cart |
| `PUT` | `/api/cart/items/:productId` | Authenticated | Update item quantity |
| `DELETE` | `/api/cart/items/:productId` | Authenticated | Remove item from cart |

### Orders

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/orders` | Authenticated | Get current user's orders |
| `GET` | `/api/orders/all` | Admin | Get all orders |
| `POST` | `/api/orders` | Authenticated | Place order from cart |
| `PUT` | `/api/orders/:id/status` | Admin | Update order status |

---

## 🗄️ Database Schema

### `users`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `email` | String | Unique, required |
| `password_hash` | String | Bcrypt hashed |
| `is_admin` | Boolean | Default: `false` |

### `products`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `name` | String | Required |
| `description` | String | Required |
| `price` | Number | Positive, required |
| `category` | String | Required |
| `stock` | Number | Non-negative integer |
| `image` | String | Cloudinary URL, optional |

### `carts`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `user_id` | ObjectId | ref: User |
| `product_id` | ObjectId | ref: Product |
| `quantity` | Number | Positive integer |

### `orders`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `userId` | ObjectId | ref: User |
| `items` | Array | Embedded snapshot |
| `total` | Number | Grand total in USD |
| `status` | String | pending / processing / shipped / completed / cancelled |

### `reviews`
| Field | Type | Notes |
|---|---|---|
| `_id` | ObjectId | Auto-generated |
| `productId` | ObjectId | ref: Product |
| `userId` | ObjectId | ref: User |
| `username` | String | Snapshot at review time |
| `rating` | Number | 1–5 |
| `comment` | String | Optional |
| `createdAt` | Date | Auto-set by Mongoose |

---

## 🔐 Authentication Flow

```
1. User submits login form
        ↓
2. POST /api/auth/login
        ↓
3. Server verifies credentials → issues JWT
        ↓
4. JWT stored in HTTP-only cookie (not localStorage)
        ↓
5. Every subsequent request → browser sends cookie automatically
        ↓
6. requireAuth middleware verifies token on protected routes
        ↓
7. requireAdmin middleware checks is_admin on admin routes
        ↓
8. POST /api/logout → server clears the cookie
```

---

## 📄 Documentation

Full project documentation is available in the `/docs` folder:

| Document | Description |
|---|---|
| `01_project_overview.pdf` | Introduction, objectives, scope, and entities |
| `02_functional_requirements.pdf` | FRD — all user-facing feature requirements |
| `03_technical_requirements.pdf` | TRD — stack, architecture, infrastructure |
| `04_database_schema.pdf` | All collections, fields, constraints, relationships |
| `05_api_documentation.pdf` | All endpoints, request/response formats, best practices |

---

<div align="center">

Made with ☕ — MR-ROBOT

</div>
