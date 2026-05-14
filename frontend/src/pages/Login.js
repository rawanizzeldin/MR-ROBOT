import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Requirement: Form Validation with Yup
  const loginSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
  });

  return (
    <div className="container mt-5" style={{ maxWidth: "400px" }}>
      <div className="card p-4 shadow-sm">
        <h2 className="text-center mb-3">Sign In</h2>
        
        <Formik
          initialValues={{ email: "", password: "" }}
          validationSchema={loginSchema}
          onSubmit={async (values, { setSubmitting, setStatus }) => {
            try {
              // Requirement: Interaction with Backend API
              const res = await api.post("/auth/login", values);
              
              // Cookie handles the token automatically
              login(res.data.user); 
              
              navigate("/dashboard");
            } catch (err) {
              setStatus("Invalid email or password.");
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({ errors, touched, isSubmitting, status }) => (
            <Form>
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

              {/* Requirement: Graceful Error Handling */}
              {status && <div className="alert alert-danger p-2">{status}</div>}

              <button 
                type="submit" 
                className="btn btn-primary w-100" 
                disabled={isSubmitting}
              >
                {isSubmitting ? "Logging in..." : "Login"}
              </button>
            </Form>
          )}
        </Formik>

        <p className="text-center mt-3">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;