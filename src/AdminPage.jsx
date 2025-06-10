import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './AdminPage.css';

const API_BASE = process.env.REACT_APP_API_BASE_URL || "http://localhost:3000";
const baseUrl = import.meta.env.VITE_BACKEND_URL;

export default function AdminPage() {
  const [stores, setStores] = useState([]);
  const [items, setItems] = useState([]);
  const [newStore, setNewStore] = useState('');
  const [newItem, setNewItem] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const navigate = useNavigate();

  const fetchOptions = async () => {
    const [sRes, iRes] = await Promise.all([
      fetch(`${API_BASE}/stores`),
      fetch(`${API_BASE}/items`),
    ]);
    setStores(await sRes.json());
    setItems(await iRes.json());
  };

  useEffect(() => {
    fetchOptions();
  }, []);

  const addStore = async () => {
    await fetch(`${API_BASE}/stores`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newStore })
    });
    setNewStore('');
    fetchOptions();
  };

  const addItem = async () => {
    await fetch(`${API_BASE}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newItem, price: parseFloat(newPrice) || 0 })
    });
    setNewItem('');
    setNewPrice('');
    fetchOptions();
  };

  return (
    <div className="admin-container">
      <button className="back-button" onClick={() => navigate("/")}>Back to Dashboard</button>
      <h1 className="page-title">Manage Items & Stores</h1>

      <section className="section">
        <h2>Stores</h2>
        <ul className="list">
          {stores.map((s) => (
            <li key={s} className="list-item">
              <span className="label">{s}</span>
              <button className="delete-btn" onClick={async () => {
                await fetch(`${API_BASE}/stores/${encodeURIComponent(s)}`, { method: "DELETE" });
                fetchOptions();
              }}>Delete</button>
            </li>
          ))}
        </ul>
        <div className="form-row">
          <input
            type="text"
            placeholder="New store name"
            value={newStore}
            onChange={(e) => setNewStore(e.target.value)}
          />
          <button onClick={addStore}>Add Store</button>
        </div>
      </section>

      <section className="section">
        <h2>Items</h2>
        <ul className="list">
          {items.map((item) => (
            <li key={item.name} className="list-item">
              <span className="label">{item.name} — ${parseFloat(item.price).toFixed(2)}</span>
              <button className="delete-btn" onClick={async () => {
                await fetch(`${API_BASE}/items/${encodeURIComponent(item.name)}`, { method: "DELETE" });
                fetchOptions();
              }}>Delete</button>
            </li>
          ))}
        </ul>
        <div className="form-row">
          <input
            type="text"
            placeholder="New item"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
          <input
            type="number"
            placeholder="Price (e.g. 4.99)"
            value={newPrice}
            onChange={(e) => setNewPrice(e.target.value)}
          />
          <button onClick={addItem}>Add Item</button>
        </div>
      </section>
    </div>
  );
}