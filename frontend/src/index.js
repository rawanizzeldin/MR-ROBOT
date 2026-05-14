import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Requirement: Global State Management (AuthContext)
import { AuthProvider } from "./auth/AuthContext";

// Initializing the React Root
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <AuthProvider>
    <App />
  </AuthProvider>
);