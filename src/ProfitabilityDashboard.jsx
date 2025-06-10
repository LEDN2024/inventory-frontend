import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./ProfitabilityDashboard.css";

const baseUrl = import.meta.env.VITE_BACKEND_URL;

function ProfitabilityDashboard() {
  const [storeOptions, setStoreOptions] = useState([]);
  const [storeName, setStoreName] = useState("All");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sales, setSales] = useState("");
  const [cogs, setCogs] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStores = async () => {
      try {
        const res = await fetch(`${baseUrl}/stores`);
        const data = await res.json();
        setStoreOptions(["All", ...data]);
      } catch (err) {
        console.error("Failed to load stores", err);
      }
    };
    fetchStores();
  }, []);

  const fetchCOGS = async () => {
    try {
      if (!startDate || !endDate) {
        alert("Please select both start and end dates.");
        return;
      }

      const params = new URLSearchParams({
        start_date: startDate,
        end_date: endDate,
      });

      if (storeName !== "All") {
        params.append("store_name", storeName);
      }

      const res = await fetch(`${baseUrl}/profitability?${params.toString()}`);
      if (!res.ok) {
        throw new Error("Failed to fetch COGS");
      }

      const data = await res.json();
      setCogs(data.total_cogs || 0);
    } catch (err) {
      console.error("Error fetching COGS:", err);
      alert("There was an error fetching profitability data.");
    }
  };

  const cogsPercent =
    sales && !isNaN(sales) && parseFloat(sales) > 0
      ? ((cogs / parseFloat(sales)) * 100).toFixed(2)
      : "0.00";

  return (
    <div className="profitability-container">
      <div className="top-bar">
        <button className="back-button" onClick={() => navigate("/")}>
          Back to Dashboard
        </button>
      </div>

      <h1 className="profit-title">Profitability Dashboard</h1>

      <div className="profit-section">
        <label>Store</label>
        <select value={storeName} onChange={(e) => setStoreName(e.target.value)}>
          {storeOptions.map((store) => (
            <option key={store} value={store}>
              {store === "All" ? "All Stores" : store}
            </option>
          ))}
        </select>
      </div>

      <div className="profit-section">
        <label>Start Date</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
      </div>

      <div className="profit-section">
        <label>End Date</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      <div className="profit-section">
        <label>Sales ($)</label>
        <input type="number" value={sales} onChange={(e) => setSales(e.target.value)} />
      </div>

      <button className="calculate-button" onClick={fetchCOGS}>
        Calculate
      </button>

      <div className="results">
        <h3>Total COGS: ${cogs.toFixed(2)}</h3>
        <h3>COGS as % of Sales: {cogsPercent}%</h3>
      </div>
    </div>
  );
}

export default ProfitabilityDashboard;