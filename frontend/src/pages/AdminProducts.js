import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { Navigate, Link, useNavigate } from "react-router-dom";
import "../styles.css";

const CATEGORIES = [
  "Electronics",
  "Accessories",
  "Phones",
  "Desktops",
  "Other"
];

// ─── Validation schema ────────────────────────────────────────────────────────
// "image" is now a File object (or null), not a URL string anymore.
// Yup doesn't validate File objects the same way, so we use .nullable()
// and do a simple file-type check with .test().
const productSchema = Yup.object({
  name: Yup.string().required("Required"),

  description: Yup.string().required("Required"),

  price: Yup.number()
    .positive("Must be positive")
    .required("Required"),

  category: Yup.string().required("Required"),

  stock: Yup.number()
    .integer("Must be a whole number")
    .min(0, "Cannot be negative")
    .required("Required"),

  // image is optional — can be a File (new upload), a URL string (existing),
  // or null/empty (no image)
  image: Yup.mixed()
    .nullable()
    .test(
      "fileType",
      "Only image files are allowed (jpg, jpeg, png, webp)",
      (value) => {
        // If it's a File object, validate its type
        if (value instanceof File) {
          return ["image/jpeg", "image/jpg", "image/png", "image/webp"].includes(
            value.type
          );
        }
        // If it's a string (existing URL) or null/empty, that's fine
        return true;
      }
    )
    .test(
      "fileSize",
      "File must be smaller than 5MB",
      (value) => {
        if (value instanceof File) {
          return value.size <= 5 * 1024 * 1024; // 5 MB limit
        }
        return true;
      }
    ),
});

// emptyProduct now uses null for image instead of an empty string URL
const emptyProduct = {
  name: "",
  description: "",
  price: "",
  category: "Other",
  stock: 0,
  image: null,
};

export default function AdminProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts]     = useState([]);
  const [editingProduct, setEditing] = useState(null);
  const [showForm, setShowForm]     = useState(false);
  const [message, setMessage]       = useState("");
  const [error, setError]           = useState("");

  // Preview URL for the image the admin picked — shown below the file input
  const [imagePreview, setImagePreview] = useState(null);

  if (!user || !user.is_admin) {
    return <Navigate to="/" replace />;
  }

  // ─── Load all products ──────────────────────────────────────────────────────
  const fetchProducts = async () => {
    try {
      const res = await api.get("/products");
      setProducts(res.data);
    } catch {
      setError("Could not load products.");
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ─── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }
    try {
      await api.delete(`/products/${productId}`);
      setMessage("Product removed from database.");
      fetchProducts();
    } catch (err) {
      console.error("Delete failed:", err.response?.data);
      setError(
        err.response?.data?.error || "Delete failed. Verify admin privileges."
      );
    }
  };

  // ─── Submit (Add or Edit) ───────────────────────────────────────────────────
  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    setMessage("");
    setError("");

    try {
      // ── Build a FormData object instead of plain JSON ──────────────────────
      // This is REQUIRED because we're sending a file (multipart/form-data).
      // Express + Multer on the backend will parse this correctly.
      const formData = new FormData();
      formData.append("name",        values.name);
      formData.append("description", values.description);
      formData.append("price",       Number(values.price));
      formData.append("category",    values.category);
      formData.append("stock",       Number(values.stock));

      // Only append the image field if the admin actually picked a new file.
      // If values.image is a File object  → new upload, send to Cloudinary.
      // If values.image is a string (URL) → existing image, no re-upload needed.
      // If values.image is null/empty     → no image.
      if (values.image instanceof File) {
        formData.append("image", values.image);
      } else if (typeof values.image === "string" && values.image) {
        // Editing a product but no new file chosen — keep the existing URL
        formData.append("image", values.image);
      }

      if (editingProduct) {
        // PUT uses the same multipart approach
        await api.put(`/products/${editingProduct.id}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage("Product updated successfully!");
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setMessage("Product added to database!");
      }

      resetForm();
      setShowForm(false);
      setEditing(null);
      setImagePreview(null);
      await fetchProducts();

    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "Could not save to database."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Open form for editing an existing product ──────────────────────────────
  const startEdit = (p) => {
    setEditing(p);
    setShowForm(true);
    setMessage("");
    setError("");
    // Show the existing image as a preview so the admin can see what's there
    setImagePreview(p.image || null);
  };

  // ─── Open blank form for a new product ──────────────────────────────────────
  const startAdd = () => {
    setEditing(null);
    setShowForm(true);
    setMessage("");
    setError("");
    setImagePreview(null);
  };

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page">

      {/* Header row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28,
        }}
      >
        <div>
          <Link to="/admin" style={{ color: "var(--muted)", fontSize: "0.85rem" }}>
            ← Admin Panel
          </Link>
          <h2 className="page-title" style={{ marginTop: 6 }}>
            Manage Products
          </h2>
          <p className="subtitle">Real-time database inventory management</p>
        </div>

        <button className="btn btn-primary" onClick={startAdd}>
          + Add Product
        </button>
      </div>

      {/* Feedback banners */}
      {message && <div className="alert alert-success">{message}</div>}
      {error   && <div className="alert alert-error">{error}</div>}

      {/* ── Add / Edit form ── */}
      {showForm && (
        <div className="card card-elevated" style={{ marginBottom: 28 }}>
          <h3>{editingProduct ? "Edit Product" : "New Product"}</h3>

          <Formik
            enableReinitialize
            initialValues={
              editingProduct
                ? {
                    name:        editingProduct.name,
                    description: editingProduct.description,
                    price:       editingProduct.price,
                    category:    editingProduct.category,
                    stock:       editingProduct.stock,
                    // Keep the existing URL string so the backend knows
                    // not to remove the image if no new file is chosen
                    image:       editingProduct.image || null,
                  }
                : emptyProduct
            }
            validationSchema={productSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting, setFieldValue }) => (
              <Form>

                {/* Name */}
                <div className="field-group">
                  <label>Product Name</label>
                  <Field name="name" />
                  {touched.name && errors.name && (
                    <div className="field-error">{errors.name}</div>
                  )}
                </div>

                {/* Description */}
                <div className="field-group">
                  <label>Description</label>
                  <Field as="textarea" name="description" />
                  {touched.description && errors.description && (
                    <div className="field-error">{errors.description}</div>
                  )}
                </div>

                {/* Price + Stock — side by side */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px",
                  }}
                >
                  <div className="field-group">
                    <label>Price ($)</label>
                    <Field name="price" type="number" step="0.01" />
                    {touched.price && errors.price && (
                      <div className="field-error">{errors.price}</div>
                    )}
                  </div>

                  <div className="field-group">
                    <label>Stock</label>
                    <Field name="stock" type="number" />
                    {touched.stock && errors.stock && (
                      <div className="field-error">{errors.stock}</div>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="field-group">
                  <label>Category</label>
                  <Field as="select" name="category">
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </Field>
                  {touched.category && errors.category && (
                    <div className="field-error">{errors.category}</div>
                  )}
                </div>

                {/* ── Image upload field (replaces the old URL text input) ── */}
                <div className="field-group">
                  <label>Product Image</label>

                  {/* Native file input — NOT a <Field> because Formik can't
                      handle file inputs directly. We use setFieldValue instead. */}
                  <input
                    type="file"
                    accept="image/jpeg, image/jpg, image/png, image/webp"
                    style={{ display: "block", marginBottom: 8 }}
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (!file) return;

                      // Put the actual File object into Formik state
                      setFieldValue("image", file);

                      // Generate a local preview URL so the admin can see
                      // the image before saving
                      const previewUrl = URL.createObjectURL(file);
                      setImagePreview(previewUrl);
                    }}
                  />

                  {/* Show a small preview of the selected / existing image */}
                  {imagePreview && (
                    <div style={{ marginBottom: 8 }}>
                      <img
                        src={imagePreview}
                        alt="Preview"
                        style={{
                          width: 120,
                          height: 120,
                          objectFit: "cover",
                          borderRadius: 8,
                          border: "1px solid #ddd",
                        }}
                      />
                      <div
                        style={{
                          fontSize: "0.75rem",
                          color: "var(--muted)",
                          marginTop: 4,
                        }}
                      >
                        {editingProduct && !(errors.image)
                          ? "Current image — pick a new file to replace it"
                          : "Selected image preview"}
                      </div>
                    </div>
                  )}

                  {/* Validation error (wrong type or too large) */}
                  {touched.image && errors.image && (
                    <div className="field-error">{errors.image}</div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Saving..." : "Confirm Changes"}
                  </button>

                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setImagePreview(null);
                    }}
                  >
                    Cancel
                  </button>
                </div>

              </Form>
            )}
          </Formik>
        </div>
      )}

      {/* ── Products table ── */}
      <div className="card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p.id}>

                {/* Show a thumbnail in the table so admins can verify the image */}
                <td>
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      style={{
                        width: 48,
                        height: 48,
                        objectFit: "cover",
                        borderRadius: 6,
                        border: "1px solid #eee",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 6,
                        background: "#f0f0f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.7rem",
                        color: "#aaa",
                      }}
                    >
                      No img
                    </div>
                  )}
                </td>

                <td>
                  <div style={{ fontWeight: 500 }}>{p.name}</div>
                </td>

                <td>{p.category}</td>

                <td>${p.price}</td>

                <td>{p.stock}</td>

                <td>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => startEdit(p)}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(p.id)}
                    >
                      Delete
                    </button>
                  </div>
                </td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
}