import React, { useEffect, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import "../styles.css";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  if (!user || !user.is_admin) return <Navigate to="/" replace />;

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders/all");
      setOrders(res.data);
    } catch {
      setError("Could not load orders.");
    }
  };

  useEffect(() => { fetchOrders(); }, []);

  const updateStatus = async (orderId, status) => {
    setMessage(""); setError("");
    try {
      await api.put(`/orders/${orderId}/status`, { status });
      setMessage(`Order #${orderId} updated to "${status}".`);
      fetchOrders();
    } catch {
      setError("Could not update order status.");
    }
  };

  const statusOptions = ["pending", "processing", "shipped", "completed", "cancelled"];

  const badgeClass = (status) => {
    if (status === "completed") return "badge-green";
    if (status === "cancelled") return "badge badge-danger";
    return "badge-purple";
  };

  return (
    <div className="page">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h2 className="page-title">Admin Panel</h2>
          <p className="subtitle">Manage orders and products</p>
        </div>
        <Link to="/admin/products" className="btn btn-primary">Manage Products →</Link> 
      </div>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 28 }}>
        {[
          { label: "Total Orders", value: orders.length },
          { label: "Pending", value: orders.filter(o => o.status === "pending").length },
          { label: "Completed", value: orders.filter(o => o.status === "completed").length },
          { label: "Cancelled", value: orders.filter(o => o.status === "cancelled").length },
        ].map((s) => (
          <div className="card" key={s.label} style={{ textAlign: "center", padding: "16px 12px" }}>
            <div style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--accent)" }}>{s.value}</div>
            <div style={{ color: "var(--muted)", fontSize: "0.78rem", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="section-label">All Orders</div>
        {orders.length === 0 && !error ? (
          <div className="state-center">No orders yet.</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>User</th>
                <th>Total</th>
                <th>Status</th>
                <th>Update Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td style={{ fontWeight: 600 }}>#{o._id ? o._id.substring(0, 8) : "N/A"}</td>
                  <td style={{ color: "var(--muted)" }}>{o.userEmail || o.userId}</td>
                  <td><span className="badge badge-purple">${o.total}</span></td>
                  <td><span className={`badge ${badgeClass(o.status)}`}>{o.status}</span></td>
                  <td>
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o._id, e.target.value)}
                      style={{ width: "auto", padding: "5px 10px", fontSize: "0.82rem" }}
                    >
                      {statusOptions.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}