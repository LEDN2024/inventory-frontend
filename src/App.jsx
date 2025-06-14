import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

import SignupPage from './SignupPage';
import LoginPage from './LoginPage';
import InventoryDashboard from './InventoryDashboard';
import ManageUsersPage from './ManageUsersPage';
import AdminPage from './AdminPage';
import ProfitabilityDashboard from './ProfitabilityDashboard';
import AlertPreferences from './AlertPreferences';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

const baseUrl = import.meta.env.VITE_BACKEND_URL;

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const isAuthenticated = !!token;
  const isManager = role === "manager";

  return (
    <Routes>
      <Route path="/signup" element={<SignupPage />} />
      <Route
        path="/login"
        element={
          <LoginPage
            onLogin={(token, role) => {
              localStorage.setItem("token", token);
              localStorage.setItem("role", role);
              window.location.href = "/";
            }}
          />
        }
      />
      <Route
        path="/"
        element={
          isAuthenticated ? <InventoryDashboard /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/manage-users"
        element={
          isAuthenticated && isManager ? <ManageUsersPage /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/developer-admin"
        element={
          isAuthenticated && isManager ? <AdminPage /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/profitability"
        element={
          isAuthenticated && isManager ? <ProfitabilityDashboard /> : <Navigate to="/login" />
        }
      />
      <Route
        path="/alert-preferences"
        element={
          isAuthenticated && isManager ? <AlertPreferences /> : <Navigate to="/login" />
        }
      />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? "/" : "/login"} />}
      />
    </Routes>
  );
}

export default App;