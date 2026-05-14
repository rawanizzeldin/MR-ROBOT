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

  image: Yup.string()
    .url("Must be a valid URL")
    .nullable()
});

const emptyProduct = {
  name: "",
  description: "",
  price: "",
  category: "Other",
  stock: 0,
  image: ""
};

export default function AdminProducts() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [editingProduct, setEditing] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (!user || !user.is_admin) {
    return <Navigate to="/" replace />;
  }

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
        err.response?.data?.error ||
        "Delete failed. Verify admin privileges."
      );
    }
  };

  const handleSubmit = async (
    values,
    { setSubmitting, resetForm }
  ) => {
    setMessage("");
    setError("");

    try {
      const payload = {
        name: values.name,
        description: values.description,
        price: Number(values.price),
        category: values.category,
        stock: Number(values.stock),
        image: values.image || null
      };

      if (editingProduct) {
        await api.put(
          `/products/${editingProduct.id}`,
          payload
        );
      } else {
        await api.post("/products", payload);
      }

      resetForm();

      setShowForm(false);

      setEditing(null);

      await fetchProducts();

      navigate("/admin");

    } catch (err) {
      console.error(err);

      setError("Could not save to database.");
    } finally {
      setSubmitting(false);
    }
  };

  const startEdit = (p) => {
    setEditing(p);

    setShowForm(true);

    setMessage("");

    setError("");
  };

  const startAdd = () => {
    setEditing(null);

    setShowForm(true);

    setMessage("");

    setError("");
  };

  return (
    <div className="page">

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 28
        }}
      >
        <div>
          <Link
            to="/admin"
            style={{
              color: "var(--muted)",
              fontSize: "0.85rem"
            }}
          >
            ← Admin Panel
          </Link>

          <h2
            className="page-title"
            style={{ marginTop: 6 }}
          >
            Manage Products
          </h2>

          <p className="subtitle">
            Real-time database inventory management
          </p>
        </div>

        <button
          className="btn btn-primary"
          onClick={startAdd}
        >
          + Add Product
        </button>
      </div>

      {message && (
        <div className="alert alert-success">
          {message}
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {showForm && (
        <div
          className="card card-elevated"
          style={{ marginBottom: 28 }}
        >
          <h3>
            {editingProduct
              ? "Edit Product"
              : "New Product"}
          </h3>

          <Formik
            enableReinitialize
            initialValues={
              editingProduct || emptyProduct
            }
            validationSchema={productSchema}
            onSubmit={handleSubmit}
          >
            {({
              errors,
              touched,
              isSubmitting
            }) => (
              <Form>

                <div className="field-group">
                  <label>Product Name</label>

                  <Field name="name" />

                  {touched.name && errors.name && (
                    <div className="field-error">
                      {errors.name}
                    </div>
                  )}
                </div>

                <div className="field-group">
                  <label>Description</label>

                  <Field
                    as="textarea"
                    name="description"
                  />

                  {touched.description &&
                    errors.description && (
                      <div className="field-error">
                        {errors.description}
                      </div>
                    )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "20px"
                  }}
                >

                  <div className="field-group">
                    <label>Price ($)</label>

                    <Field
                      name="price"
                      type="number"
                      step="0.01"
                    />

                    {touched.price &&
                      errors.price && (
                        <div className="field-error">
                          {errors.price}
                        </div>
                      )}
                  </div>

                  <div className="field-group">
                    <label>Stock</label>

                    <Field
                      name="stock"
                      type="number"
                    />

                    {touched.stock &&
                      errors.stock && (
                        <div className="field-error">
                          {errors.stock}
                        </div>
                      )}
                  </div>
                </div>

                <div className="field-group">
                  <label>Category</label>

                  <Field
                    as="select"
                    name="category"
                  >
                    {CATEGORIES.map((cat) => (
                      <option
                        key={cat}
                        value={cat}
                      >
                        {cat}
                      </option>
                    ))}
                  </Field>

                  {touched.category &&
                    errors.category && (
                      <div className="field-error">
                        {errors.category}
                      </div>
                    )}
                </div>

                <div className="field-group">
                  <label>Image URL</label>

                  <Field name="image" />

                  {touched.image &&
                    errors.image && (
                      <div className="field-error">
                        {errors.image}
                      </div>
                    )}
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: 10,
                    marginTop: 20
                  }}
                >
                  <button
                    className="btn btn-primary"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting
                      ? "Saving..."
                      : "Confirm Changes"}
                  </button>

                  <button
                    className="btn btn-ghost"
                    type="button"
                    onClick={() =>
                      setShowForm(false)
                    }
                  >
                    Cancel
                  </button>
                </div>

              </Form>
            )}
          </Formik>
        </div>
      )}

      <div className="card">
        <table className="data-table">

          <thead>
            <tr>
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

                <td>
                  <div
                    style={{ fontWeight: 500 }}
                  >
                    {p.name}
                  </div>
                </td>

                <td>{p.category}</td>

                <td>${p.price}</td>

                <td>{p.stock}</td>

                <td>
                  <div
                    style={{
                      display: "flex",
                      gap: 8
                    }}
                  >
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() =>
                        startEdit(p)
                      }
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() =>
                        handleDelete(p.id)
                      }
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