import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./SignupPage.css";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

function LoginPage({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("Sending login credentials:", form);
    console.log("POSTing to:", baseUrl + "/login");

    try {
      const res = await fetch(`${baseUrl}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", data.role);

        if (typeof onLogin === "function") {
          onLogin(data.token, data.role);
        } else {
          navigate("/");
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (err) {
      console.error("Login request failed:", err);
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-box">
        <h1 className="brand">ScoopBase</h1>
        <p className="subtitle">Digital Inventory Solutions</p>
        <h2 className="form-title">Login</h2>

        <form onSubmit={handleSubmit} className="signup-form">
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            required
          />
          <button type="submit">Login</button>
        </form>

        <p style={{ marginTop: "0.5rem" }}>
          <a href="/forgot-password" style={{ color: "#007aff" }}>
            Forgot Password?
          </a>
        </p>

        {error && <p className="error">{error}</p>}
      </div>
    </div>
  );
}

export default LoginPage;