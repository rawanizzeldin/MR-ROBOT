import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { api } from "../api/client";

export default function OrderDetails() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  // Requirement: Fetching dynamic data using URL Parameters (useParams)
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await api.get(`/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        setError("Could not load order details.");
      }
    };
    fetchOrder();
  }, [id]);

  if (error) return (
    <div className="container mt-4">
      <div className="alert alert-danger">{error}</div>
      <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
    </div>
  );

  if (!order) return <div className="container mt-4">Loading order...</div>;

  return (
    <div className="container mt-4" style={{ maxWidth: "700px" }}>
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link to="/dashboard">Dashboard</Link></li>
          <li className="breadcrumb-item active">Order Details</li>
        </ol>
      </nav>

      <div className="card shadow-sm p-4 mb-4">
        <h3>Order #{order._id.substring(0, 8)}</h3>
        <hr />
        <div className="row">
          <div className="col-6">
            <p className="text-muted mb-0">Status</p>
            <span className="badge bg-success">{order.status}</span>
          </div>
          <div className="col-6">
            <p className="text-muted mb-0">Total Amount</p>
            <h4 className="text-primary">${order.totalAmount}</h4>
          </div>
        </div>
      </div>

      <div className="card shadow-sm p-4">
        <h5>Items Purchased</h5>
        <ul className="list-group list-group-flush">
          {order.items.map((item, index) => (
            <li key={index} className="list-group-item d-flex justify-content-between align-items-center px-0">
              <div>
                <strong>{item.product?.name || "Product"}</strong>
                <br />
                <small className="text-muted">Quantity: {item.quantity}</small>
              </div>
              <span className="fw-bold">${item.product?.price * item.quantity}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}