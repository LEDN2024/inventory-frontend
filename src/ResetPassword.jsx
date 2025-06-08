import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function ResetPassword() {
  const [params] = useSearchParams();
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const token = params.get('token');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:3000/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });

    if (res.ok) {
      setStatus('Password updated! You may now log in.');
    } else {
      setStatus('Invalid or expired token.');
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