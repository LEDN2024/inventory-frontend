import React, { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import "./InventoryDashboard.css";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

function InventoryDashboard() {
  const [form, setForm] = useState({
    item_type: "",
    delivery_number: "",
    delivery_date: "",
    storage_location: "",
    store_name: "",
  });
  const [filters, setFilters] = useState({
    store_name: "All",
    item_type: "All",
    status: "All",
    delivery_number: "",
    delivery_date: "",
  });
  const [items, setItems] = useState([]);
  const [itemOptions, setItemOptions] = useState([]);
  const [storeOptions, setStoreOptions] = useState([]);
  const [searchId, setSearchId] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [scannedItem, setScannedItem] = useState(null);
  const [newId, setNewId] = useState(null);

  useEffect(() => {
    fetch(`${baseUrl}/stores`).then(res => res.json()).then(setStoreOptions);
    fetch(`${baseUrl}/items`).then(res => res.json()).then(setItemOptions);
    fetchItems();
  }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });
  const handleFilterChange = e => setFilters({ ...filters, [e.target.name]: e.target.value });

  const generateId = () => Math.random().toString(36).substring(2, 10);

  const handleSubmit = async e => {
    e.preventDefault();
    const id = generateId();
    const payload = {
      ...form,
      qr_id: id,
      qr_code_id: id,
    };

    const res = await fetch(`${baseUrl}/inventory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      const newItem = await res.json();
      setNewId(id);
      setShowModal(true);
      setForm({ item_type: "", delivery_number: "", delivery_date: "", storage_location: "", store_name: "" });
      fetchItems();
    }
  };

  const fetchItems = async () => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([k, v]) => {
      if (v && v !== "All") params.append(k, v);
    });
    const res = await fetch(`${baseUrl}/inventory?${params.toString()}`);
    const data = await res.json();
    setItems(data);
  };

  const exportCSV = () => {
    const rows = items.map(i => [i.qr_code_id, i.item_type, i.store_name, i.delivery_number, new Date(i.delivery_date).toLocaleDateString(), i.status]);
    const csv = ["ID,Item,Store,Delivery Number,Delivery Date,Status", ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "inventory.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("Inventory Report", 14, 10);
    autoTable(doc, {
      startY: 20,
      head: [["ID", "Item", "Store", "Delivery Number", "Delivery Date", "Status"]],
      body: items.map(i => [i.qr_code_id, i.item_type, i.store_name, i.delivery_number, new Date(i.delivery_date).toLocaleDateString(), i.status])
    });
    doc.save("inventory.pdf");
  };

  const handleSearch = async () => {
    const res = await fetch(`${baseUrl}/inventory/${encodeURIComponent(searchId)}`);
    if (res.ok) {
      const found = await res.json();
      setScannedItem(found);
      setShowModal(true);
    } else {
      alert("ID not found.");
    }
  };

  const updateStatus = async (newStatus) => {
    if (!scannedItem?.qr_code_id) return;
    await fetch(`${baseUrl}/inventory/${scannedItem.qr_code_id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    setShowModal(false);
    fetchItems();
  };

  const role = localStorage.getItem("role");

  return (
    <div className="inventory-dashboard">
      <header className="dashboard-header">
        <h1>Boston Scoops Inventory</h1>
        <div className="nav-buttons">
          {role === "manager" && (
            <>
              <button onClick={() => window.location.href = "/developer-admin"}>Items & Stores</button>
              <button onClick={() => window.location.href = "/manage-users"}>Accounts</button>
              <button onClick={() => window.location.href = "/profitability"}>Profitability</button>
              <button onClick={() => window.location.href = "/alert-preferences"}>Alerts</button>
            </>
          )}
          <button className="logout" onClick={() => {
            localStorage.clear();
            window.location.href = "/login";
          }}>Logout</button>
        </div>
      </header>

      <main className="dashboard-content">
        <form onSubmit={handleSubmit} className="add-inventory">
          <select name="item_type" value={form.item_type} onChange={handleChange} required>
            <option value="">Item</option>
            {itemOptions.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
          </select>
          <select name="store_name" value={form.store_name} onChange={handleChange} required>
            <option value="">Store</option>
            {storeOptions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <input name="delivery_number" placeholder="Delivery Number" value={form.delivery_number} onChange={handleChange} required />
          <input type="date" name="delivery_date" value={form.delivery_date} onChange={handleChange} required />
          <input name="storage_location" placeholder="Storage Location" value={form.storage_location} onChange={handleChange} required />
          <button type="submit">Add Item</button>
        </form>

        <div className="qr-search">
          <input placeholder="Search by ID" value={searchId} onChange={e => setSearchId(e.target.value)} />
          <button onClick={handleSearch}>Search</button>
        </div>

        <section className="inventory-table">
          <h2>Inventory</h2>
          <div className="filter-controls">
            <select name="store_name" value={filters.store_name} onChange={handleFilterChange}>
              <option value="All">All Stores</option>
              {storeOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select name="item_type" value={filters.item_type} onChange={handleFilterChange}>
              <option value="All">All Items</option>
              {itemOptions.map(i => <option key={i.name} value={i.name}>{i.name}</option>)}
            </select>
            <select name="status" value={filters.status} onChange={handleFilterChange}>
              <option value="All">All Statuses</option>
              <option value="unopened">Unopened</option>
              <option value="opened">Opened</option>
              <option value="used">Used</option>
            </select>
            <input name="delivery_number" placeholder="Delivery Number" value={filters.delivery_number} onChange={handleFilterChange} />
            <input type="date" name="delivery_date" value={filters.delivery_date} onChange={handleFilterChange} />
            <button onClick={() => setFilters({ store_name: "All", item_type: "All", status: "All", delivery_number: "", delivery_date: "" })}>Clear Filters</button>
            <button onClick={exportPDF}>Export as PDF</button>
            <button onClick={exportCSV}>Export as CSV</button>
            <button onClick={fetchItems}>Refresh</button>
          </div>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Item</th>
                <th>Store</th>
                <th>Delivery Number</th>
                <th>Delivery Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.qr_code_id}>
                  <td>{item.qr_code_id}</td>
                  <td>{item.item_type}</td>
                  <td>{item.store_name}</td>
                  <td>{item.delivery_number}</td>
                  <td>{new Date(item.delivery_date).toLocaleDateString()}</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            {scannedItem ? (
              <>
                <h3>Item Found</h3>
                <p><strong>ID:</strong> {scannedItem.qr_code_id}</p>
                <p><strong>Item Type:</strong> {scannedItem.item_type}</p>
                <p><strong>Status:</strong> {scannedItem.status}</p>
                <p><strong>Store:</strong> {scannedItem.store_name}</p>
                <p><strong>Delivery #:</strong> {scannedItem.delivery_number}</p>
                <p><strong>Date:</strong> {new Date(scannedItem.delivery_date).toLocaleDateString()}</p>
                <p><strong>Location:</strong> {scannedItem.storage_location}</p>
                <div className="modal-buttons">
                  <button onClick={() => updateStatus("used")}>Mark Used</button>
                  <button onClick={() => updateStatus("opened")}>Mark Opened</button>
                  <button onClick={() => updateStatus("unopened")}>Mark Unopened</button>
                </div>
              </>
            ) : (
              <>
                <h3>Item Added!</h3>
                <p>Your item ID is: <strong>{newId}</strong></p>
              </>
            )}
            <button onClick={() => {
              setShowModal(false);
              setScannedItem(null);
              setNewId(null);
            }} className="close-btn">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default InventoryDashboard;