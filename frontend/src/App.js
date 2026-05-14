import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import { useAuth } from "./auth/AuthContext";

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import Cart from './pages/Cart';
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import OrderDetails from "./pages/OrderDetails";

// Admin Pages
import AdminDashboard from "./pages/AdminDashboard";
import AdminProducts from "./pages/AdminProducts";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (!user?.is_admin) return <Navigate to="/dashboard" />;
  return children;
}

function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">MR.ROBOT</Link>

        <div className="navbar-nav me-auto">
          <Link className="nav-link" to="/">Home</Link>
          <Link className="nav-link" to="/products">Shop</Link>
          {isAuthenticated && (
            user?.is_admin ? (
              <Link className="nav-link text-info" to="/admin">Admin Panel</Link>
            ) : (
              <Link className="nav-link" to="/dashboard">Dashboard</Link>
            )
          )}
        </div>

        <div className="navbar-nav">
          {isAuthenticated ? (
            <>
              {!user?.is_admin && <Link className="nav-link" to="/cart">🛒 Cart</Link>}
              <Link className="nav-link" to="/profile">{user?.username}</Link>
              <button className="btn btn-outline-light btn-sm ms-2" onClick={logout}>Logout</button>
            </>
          ) : (
            <>
              <Link className="nav-link" to="/login">Login</Link>
              <Link className="btn btn-primary btn-sm ms-2" to="/register">Register</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mt-3">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/products" element={<Products />} />

          {/* User */}
          <Route path="/cart"       element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/dashboard"  element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/profile"    element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetails /></ProtectedRoute>} />

          {/* Admin */}
          <Route path="/admin"          element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;