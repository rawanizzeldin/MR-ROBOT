import React, { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

function Cart() {
  const { isAuthenticated } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [grandTotal, setGrandTotal] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCart = async () => {
    try {
      const res = await api.get("/cart");
      setCartItems(res.data.items || []);
      setGrandTotal(res.data.grandTotal || 0);
      setError("");
    } catch (err) {
      setError("Unable to load cart. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadCart();
    } else {
      setLoading(false);
      setError("Please login to view your cart.");
    }
  }, [isAuthenticated]);

  const updateQuantity = async (productId, qty) => {
    if (qty < 1) {
      removeItem(productId); // auto-remove if quantity reaches 0
      return;
    }
    try {
      await api.put(`/cart/items/${productId}`, { quantity: qty });
      loadCart();
    } catch (err) {
      console.error("Update failed");
    }
  };

  const removeItem = async (productId) => {
    try {
      await api.delete(`/cart/items/${productId}`);
      loadCart();
    } catch (err) {
      console.error("Delete failed");
    }
  };

  const handleCheckout = async () => {
    try {
      await api.post("/orders");
      alert("Success! Your order has been placed.");
      setCartItems([]);
      setGrandTotal(0);
      loadCart();
    } catch (err) {
      alert("Checkout failed. Please try again.");
    }
  };

  if (loading) return <div className="container mt-5 text-center">Loading cart...</div>;

  return (
    <div className="container mt-4">
      <h2 className="fw-bold">Your Shopping Cart</h2>
      <hr />

      {error && !isAuthenticated ? (
        <div className="alert alert-warning shadow-sm">
          {error} <a href="/login" className="alert-link">Sign in here.</a>
        </div>
      ) : (
        <>
          {cartItems.length === 0 ? (
            <div className="card shadow-sm p-5 text-center">
              <h4 className="text-muted">Your cart is currently empty</h4>
              <button
                className="btn btn-primary px-4 mt-3"
                onClick={() => window.location.href = '/products'}
              >
                Start Shopping
              </button>
            </div>
          ) : (
            <div className="card p-3 shadow-sm border-0">
              <div className="table-responsive">
                <table className="table align-middle">
                  <thead className="table-light">
                    <tr>
                      <th>Product</th>
                      <th className="text-center">Quantity</th>
                      <th className="text-end">Price</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartItems.map((item, index) => (
                      <tr key={item.productId || index}>
                        <td>
                          <div className="d-flex align-items-center">
                            {item.image && (
                              <img src={item.image} alt={item.name} style={{ width: '50px', marginRight: '10px' }} />
                            )}
                            <div>
                              <h6 className="mb-0 fw-bold">{item.name}</h6>
                              <small className="text-muted">ID: {item.productId.substring(0, 8)}</small>
                            </div>
                          </div>
                        </td>
                        <td className="text-center">
                          <div className="d-flex align-items-center justify-content-center gap-2">
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            >−</button>
                            <span className="fw-bold px-2">{item.quantity}</span>
                            <button
                              className="btn btn-outline-secondary btn-sm"
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            >+</button>
                          </div>
                        </td>
                        <td className="text-end fw-bold">
                          ${Number(item.price || 0).toFixed(2)}
                        </td>
                        <td className="text-end">
                          <button
                            className="btn btn-outline-danger btn-sm"
                            onClick={() => removeItem(item.productId)}
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 p-3 bg-light rounded d-flex justify-content-between align-items-center">
                <h4 className="mb-0">Total Amount:</h4>
                <div className="text-end">
                  <h3 className="text-primary fw-bold mb-0">${grandTotal.toFixed(2)}</h3>
                  <button className="btn btn-success btn-lg px-5 mt-3 shadow" onClick={handleCheckout}>
                    Complete Purchase
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Cart;