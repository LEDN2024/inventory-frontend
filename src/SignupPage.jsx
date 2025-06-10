import React, { useState } from "react";
import "./SignupPage.css";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

function SignupPage() {
  const [form, setForm] = useState({
    email: "",
    password: "",
    manager_code: "",
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      const res = await fetch(`${baseUrl}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("Signup successful!");
        setForm({ email: "", password: "", manager_code: "" });
      } else {
        setError(data.error || "Signup failed.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
  };

  return (
    <div className="signup-page">
      <div className="signup-box">
        <h1 className="brand">ScoopBase</h1>
        <p className="subtitle">Digital Inventory Solutions</p>
        <h2 className="form-title">Sign Up</h2>

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
          <input
            type="text"
            name="manager_code"
            placeholder="Manager Code (optional)"
            value={form.manager_code}
            onChange={handleChange}
          />
          <button type="submit">Sign Up</button>
        </form>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}
      </div>
    </div>
  );
}

export default SignupPage;