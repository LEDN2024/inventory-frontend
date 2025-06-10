import React, { useState } from "react";
const baseUrl = import.meta.env.VITE_BACKEND_URL;

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        throw new Error("Failed to send reset link");
      }

      setSubmitted(true);
      setError("");
    } catch (err) {
      setError("Something went wrong. Try again.");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: 400, margin: "auto" }}>
      <h2>Reset Your Password</h2>
      {submitted ? (
        <p>Check your email for a password reset link.</p>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ padding: "0.5rem", width: "100%", marginBottom: "1rem" }}
          />
          <button
            type="submit"
            style={{ padding: "0.5rem", width: "100%" }}
          >
            Send Reset Link
          </button>
          {error && <p style={{ color: "red" }}>{error}</p>}
        </form>
      )}
    </div>
  );
}

export default ForgotPassword;