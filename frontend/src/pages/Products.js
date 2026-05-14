import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

const CATEGORIES = ["All", "Electronics", "Accessories", "Phones", "Desktops"];

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Requirement: Handling Query Parameters (URL Search Params)
  const [searchParams, setSearchParams] = useSearchParams();
  const activeCategory = searchParams.get("category") || "All";

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        // Build the URL based on the selected category
        const url = activeCategory === "All" ? "/products" : `/products?category=${activeCategory}`;
        const res = await api.get(url);
        setProducts(res.data);
      } catch (err) {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [activeCategory]);

  const addToCart = async (product) => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    try {
      await api.post("/cart/items", { productId: product.id, quantity: 1 });
      alert("Added to cart!");
    } catch (err) {
      alert("Failed to add to cart.");
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Our Products</h2>
        <span className="text-muted">{products.length} Items Found</span>
      </div>

      {/* Requirement: Category Filtering (User Interaction) */}
      <div className="mb-4">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`btn btn-sm me-2 ${activeCategory === cat ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => {
              if (cat === "All") {
                setSearchParams({});
              } else {
                setSearchParams({ category: cat });
              }
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        /* Requirement: Responsive Grid Layout */
        <div className="row g-4">
          {products.map((p) => (
            <div key={p.id} className="col-12 col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm">
                <img 
                  src={p.image || "https://via.placeholder.com/150"} 
                  className="card-img-top" 
                  alt={p.name} 
                  style={{ height: "200px", objectFit: "cover" }}
                />
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title">{p.name}</h5>
                  <p className="card-text text-muted small">{p.description}</p>
                  <div className="mt-auto">
                    <h5 className="text-primary">${p.price}</h5>
                    <button 
                      className="btn btn-success w-100 mt-2"
                      onClick={() => addToCart(p)}
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Products;