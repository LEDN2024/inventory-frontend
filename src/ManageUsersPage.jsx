import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ManageUsersPage.css';

const baseUrl = import.meta.env.VITE_BACKEND_URL;

function ManageUsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  const currentEmail = localStorage.getItem("email");
  const navigate = useNavigate();

  useEffect(() => {
    if (role !== "manager") {
      setError("Access denied. Manager only.");
      return;
    }

    fetch(`${baseUrl}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then(setUsers)
      .catch(() => setError("Failed to load users"));
  }, [token, role]);

  const updateRole = async (id, newRole) => {
    try {
      const res = await fetch(`${baseUrl}/users/${id}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!res.ok) throw new Error("Update failed");

      const updated = await res.json();
      setUsers((prev) =>
        prev.map((user) => (user.id === updated.id ? updated : user))
      );
    } catch (err) {
      alert("Error updating role");
    }
  };

  const deleteUser = async (id, email) => {
    if (email === currentEmail) {
      alert("You cannot delete your own account while logged in.");
      return;
    }

    if (!window.confirm(`Are you sure you want to delete ${email}?`)) return;

    try {
      const res = await fetch(`${baseUrl}/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Delete failed");

      setUsers((prev) => prev.filter((user) => user.id !== id));
    } catch (err) {
      alert("Error deleting user");
    }
  };

  if (error) return <div className="error-msg">{error}</div>;

  return (
    <div className="manage-users-container">
      <button className="back-button" onClick={() => navigate("/")}>Back to Dashboard</button>
      <h1>Manage Users</h1>
      <div className="users-table">
        <div className="table-header">
          <span>Email</span>
          <span>Current Role</span>
          <span>Change Role</span>
          <span>Actions</span>
        </div>
        {users.map(({ id, email, role }) => (
          <div className="table-row" key={id}>
            <span>{email}</span>
            <span>{role}</span>
            <span>
              <select
                value={role}
                onChange={(e) => updateRole(id, e.target.value)}
              >
                <option value="scooper">Scooper</option>
                <option value="manager">Manager</option>
              </select>
            </span>
            <span>
              <button className="delete-button" onClick={() => deleteUser(id, email)}>
                Delete
              </button>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageUsersPage;