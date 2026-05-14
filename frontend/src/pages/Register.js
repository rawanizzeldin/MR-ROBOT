import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { api } from "../api/client";

function Register() {
  const navigate = useNavigate();

  // Requirement: Form Validation using Yup
  const registerSchema = Yup.object().shape({
    username: Yup.string().required("Username is required"),
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().min(6, "Password must be at least 6 characters").required("Required"),
  });

  return (
    <div className="container mt-5" style={{ maxWidth: "450px" }}>
      <div className="card p-4 shadow-sm">
        <h2 className="text-center mb-3">Create Account</h2>
        <p className="text-center text-muted">Your journey to the best tech starts here</p>

        <Formik
          initialValues={{ username: "", email: "", password: "" }}
          validationSchema={registerSchema}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
            // ... inside onSubmit ...
try {
  // FIX: Send it exactly as 'password' because our backend auth.js 
  // is already doing the translation for us!
  const payload = {
    username: values.username,
    email: values.email,
    password: values.password 
  };

  // Requirement: POST request to API
  await api.post("/auth/register", payload);
  
  // On success, go to login page
  navigate("/login");
} catch (err) {
// ...
              setStatus("Registration failed. Email might be taken.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, isSubmitting, status }) => (
            <Form>
              <div className="mb-3">
                <label className="form-label">Username</label>
                <Field name="username" className="form-control" />
                {touched.username && errors.username && (
                  <div className="text-danger small">{errors.username}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Email</label>
                <Field name="email" type="email" className="form-control" />
                {touched.email && errors.email && (
                  <div className="text-danger small">{errors.email}</div>
                )}
              </div>

              <div className="mb-3">
                <label className="form-label">Password</label>
                <Field name="password" type="password" className="form-control" />
                {touched.password && errors.password && (
                  <div className="text-danger small">{errors.password}</div>
                )}
              </div>

              {/* Requirement: User feedback on error */}
              {status && <div className="alert alert-danger p-2">{status}</div>}

              <button 
                type="submit" 
                className="btn btn-primary w-100" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Registering..." : "Sign Up"}
              </button>
            </Form>
          )}
        </Formik>

        <p className="text-center mt-3">
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;