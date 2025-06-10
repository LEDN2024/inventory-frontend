import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
const baseUrl = import.meta.env.VITE_BACKEND_URL;

function ResetPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const token = params.get('token');
  const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, new_password: password }),
      });

      if (res.ok) {
        setStatus('Password updated! You may now log in.');
      } else {
        setStatus('Invalid or expired token.');
      }
    } catch (err) {
      console.error("Error resetting password:", err);
      setStatus('Something went wrong. Please try again.');
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Reset Password</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">Reset Password</button>
      </form>
      <p>{status}</p>
    </div>
  );
}

export default ResetPassword;