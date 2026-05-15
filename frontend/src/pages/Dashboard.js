import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        const data = Array.isArray(res.data) ? res.data : [];
        setOrders(data);
      } catch (err) {
        console.error("Fetch orders error:", err?.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        Loading orders...
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="card p-4 mb-4 text-center border-0 shadow-sm">
        <h2>Welcome, {user?.username || "Valued Customer"}! 👋</h2>
        <p className="text-muted">
          Manage your account and view your recent activity.
        </p>

        <div className="d-flex justify-content-center gap-3 mt-2">
          <Link to="/products" className="btn btn-primary">Browse Shop</Link>
          <Link to="/cart" className="btn btn-outline-primary">My Cart</Link>
          {user?.is_admin && (
            <Link to="/admin" className="btn btn-danger">Admin Panel</Link>
          )}
        </div>
      </div>

      <div className="card p-3 shadow-sm border-0">
        <h4 className="fw-bold">Recent Orders</h4>
        <hr />

        {orders.length === 0 ? (
          <div className="text-center py-4">
            <p className="mb-1">You haven't placed any orders yet.</p>
            <Link to="/products" className="fw-bold">
              Start shopping now
            </Link>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table align-middle">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => {
                  const total = Number(order.total ?? 0);
                  return (
                    <tr key={order._id}>
                      <td className="text-muted">
                        #{order._id ? order._id.substring(0, 8) : "N/A"}...
                      </td>
                      <td className="fw-bold">
                        ${total.toFixed(2)}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            order.status === "Completed"
                              ? "bg-success"
                              : "bg-primary"
                          }`}
                        >
                          {order.status || "Pending"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}