import React, { useEffect, useState } from 'react';
import './AlertPreferences.css';

const API = process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";
const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function AlertPreferences() {
  const [storeOptions, setStoreOptions] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [form, setForm] = useState({ store_name: '', item_type: '', threshold: '' });
  const [alerts, setAlerts] = useState([]);

  const fetchDropdowns = async () => {
    try {
      const [storesRes, itemsRes, alertsRes] = await Promise.all([
        fetch(`${API}/stores`),
        fetch(`${API}/items`),
        fetch(`${API}/alerts`)
      ]);
      setStoreOptions(await storesRes.json());
      setItemOptions(await itemsRes.json());
      setAlerts(await alertsRes.json());
    } catch (err) {
      console.error("Failed to fetch dropdown or alerts data:", err);
    }
  };

  useEffect(() => {
    fetchDropdowns();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API}/alerts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, manager_email: "admin@scoops.com" })
      });
      if (res.ok) {
        setForm({ store_name: '', item_type: '', threshold: '' });
        fetchDropdowns(); // refresh alerts
      }
    } catch (err) {
      console.error("Error adding alert:", err);
    }
  };

  const deleteAlert = async (id) => {
    try {
      await fetch(`${API}/alerts/${id}`, { method: 'DELETE' });
      setAlerts(alerts.filter(a => a.id !== id));
    } catch (err) {
      console.error("Error deleting alert:", err);
    }
  };

  return (
    <div className="alert-container">
      <button className="back-button" onClick={() => window.location.href = "/"}>Back to Dashboard</button>
      <h1>Manage Alert Preferences</h1>

      <form className="alert-form" onSubmit={handleSubmit}>
        <label>
          Store:
          <select name="store_name" value={form.store_name} onChange={handleChange} required>
            <option value="">Select Store</option>
            {storeOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </label>

        <label>
          Item:
          <select name="item_type" value={form.item_type} onChange={handleChange} required>
            <option value="">Select Item</option>
            {itemOptions.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
          </select>
        </label>

        <label>
          Minimum Threshold:
          <input name="threshold" type="number" value={form.threshold} onChange={handleChange} required />
        </label>

        <button type="submit">Add Alert</button>
      </form>

      <h2>Existing Alerts</h2>
      <ul className="alert-list">
        {alerts.length === 0 ? <p>No alerts configured.</p> : alerts.map(alert => (
          <li key={alert.id}>
            <span>{alert.store_name} — {alert.item_type} &lt; {alert.threshold}</span>
            <button onClick={() => deleteAlert(alert.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}