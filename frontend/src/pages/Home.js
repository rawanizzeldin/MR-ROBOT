import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

function Home() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const categories = [
    { icon: "💻", label: "Laptops" },
    { icon: "📱", label: "Phones" },
    { icon: "🖥️", label: "Desktops" },
    { icon: "🖱️", label: "Accessories" },
  ];

  return (
    <div className="container py-5 text-center">
      {/* Hero Section */}
      <header className="mb-5 py-5 bg-light rounded">
        <h1 className="display-4 fw-bold">MR.ROBOT</h1>
        <p className="lead text-muted">Premium tech Delivered to your doorstep</p>
        
        <div className="mt-4">
          <button className="btn btn-primary btn-lg me-2" onClick={() => navigate("/products")}>
            Browse Products
          </button>
          {!isAuthenticated && (
            <Link to="/register" className="btn btn-outline-secondary btn-lg">
              Sign Up
            </Link>
          )}
        </div>
      </header>

      {/* Categories Grid - Requirement: Responsive Layout */}
      <div className="row g-3">
        <h3 className="text-start mb-3">Shop by Category</h3>
        {categories.map((c) => (
          <div key={c.label} className="col-6 col-md-3">
            <div 
              className="card h-100 p-3 shadow-sm border-0" 
              style={{ cursor: "pointer" }}
              onClick={() => navigate("/products")}
            >
              <div className="display-6 mb-2">{c.icon}</div>
              <h6>{c.label}</h6>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Call to Action */}
      {!isAuthenticated && (
        <div className="alert alert-info mt-5 p-4 d-flex justify-content-between align-items-center">
          <div className="text-start">
            <strong>Want to start shopping?</strong>
            <p className="mb-0">Create an account to add items to your cart.</p>
          </div>
          <Link to="/register" className="btn btn-primary">Get Started</Link>
        </div>
      )}
    </div>
  );
}

export default Home;