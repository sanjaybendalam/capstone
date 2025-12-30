import React, { useState, useEffect } from "react";
import CarbonInputForm from "../components/carbon/CarbonInputForm";
import CarbonSummary from "../components/carbon/CarbonSummary";
import { saveCarbonEntries, getCarbonEntries } from "../services/api";
import { toast } from "react-toastify";

// Emission factors for calculating CO2
const EMISSION_FACTORS = {
  electricity: { factor: 0.82, unit: "kWh", category: "Energy" },
  petrol: { factor: 2.31, unit: "L", category: "Transportation" },
  diesel: { factor: 2.68, unit: "L", category: "Transportation" },
  flightShort: { factor: 0.09, unit: "km", category: "Transportation" },
  flightLong: { factor: 0.15, unit: "km", category: "Transportation" },
  lpg: { factor: 2.98, unit: "kg", category: "Energy" },
  beef: { factor: 27, unit: "kg", category: "Food" },
  chicken: { factor: 6.9, unit: "kg", category: "Food" },
  rice: { factor: 4.0, unit: "kg", category: "Food" },
  vegetables: { factor: 2.0, unit: "kg", category: "Food" },
  waste: { factor: 1.0, unit: "kg", category: "Waste" }
};

// Tips for reducing emissions by category
const REDUCTION_TIPS = {
  Transportation: [
    "🚲 Consider cycling or walking for short distances",
    "🚌 Use public transportation when possible",
    "🚗 Carpool with colleagues or friends",
    "⚡ Consider switching to an electric or hybrid vehicle"
  ],
  Energy: [
    "💡 Switch to LED bulbs to reduce electricity usage",
    "🌡️ Use smart thermostats to optimize heating/cooling",
    "☀️ Consider solar panels for renewable energy",
    "🔌 Unplug devices when not in use"
  ],
  Food: [
    "🥗 Reduce red meat consumption - try plant-based alternatives",
    "🌿 Eat more locally-grown vegetables",
    "🍽️ Plan meals to reduce food waste",
    "🌱 Consider meatless Mondays"
  ],
  Waste: [
    "♻️ Recycle paper, plastic, and glass",
    "🌿 Compost organic waste",
    "🛍️ Use reusable bags and containers",
    "📦 Reduce single-use packaging"
  ]
};

const CarbonTracker = () => {
  const [entries, setEntries] = useState({});
  const [savedData, setSavedData] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(false);

  // Calculate total CO2 from current entries
  const calculateTotalCO2 = () => {
    let total = 0;
    for (const [key, value] of Object.entries(entries)) {
      if (value > 0 && EMISSION_FACTORS[key]) {
        total += value * EMISSION_FACTORS[key].factor;
      }
    }
    return total.toFixed(2);
  };

  // Calculate CO2 by category from current entries
  const calculateCO2ByCategory = () => {
    const byCategory = { Transportation: 0, Energy: 0, Food: 0, Waste: 0 };
    for (const [key, value] of Object.entries(entries)) {
      if (value > 0 && EMISSION_FACTORS[key]) {
        const cat = EMISSION_FACTORS[key].category;
        byCategory[cat] += value * EMISSION_FACTORS[key].factor;
      }
    }
    return byCategory;
  };

  // Filter data for today only
  const getTodayData = (data) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return data.filter(entry => {
      const entryDate = new Date(entry.date || entry.createdAt);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });
  };

  // Calculate CO2 by category from saved historical data (today only)
  const calculateSavedCO2ByCategory = () => {
    const byCategory = { Transportation: 0, Energy: 0, Food: 0, Waste: 0 };
    const categoryMapping = {
      electricity: "Energy",
      transport: "Transportation",
      flight: "Transportation",
      fuel: "Energy",
      food: "Food",
      waste: "Waste"
    };

    const todayData = getTodayData(savedData);
    todayData.forEach(entry => {
      const cat = categoryMapping[entry.category] || "Other";
      if (byCategory[cat] !== undefined) {
        byCategory[cat] += entry.calculatedCO2 || 0;
      }
    });
    return byCategory;
  };

  const handleSave = async () => {
    // Validate no negative values
    for (const [key, value] of Object.entries(entries)) {
      if (value < 0) {
        toast.error(`${key} cannot have a negative value`);
        return;
      }
    }

    setLoading(true);
    try {
      await saveCarbonEntries(entries);
      toast.success("Carbon entries saved successfully!");
      // Fetch updated data after save
      const res = await getCarbonEntries();
      setSavedData(res.data || []);
      setEntries({}); // Clear form after save
    } catch (err) {
      toast.error("Failed to save entries");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getCarbonEntries();
        setSavedData(res.data || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, []);

  const categories = ["All", "Transportation", "Energy", "Food", "Waste"];

  // Use current entries if available, otherwise use saved data for display (today only)
  const hasCurrentEntries = Object.values(entries).some(v => v > 0);
  const co2ByCategory = hasCurrentEntries ? calculateCO2ByCategory() : calculateSavedCO2ByCategory();
  const highestCategory = Object.entries(co2ByCategory).sort((a, b) => b[1] - a[1])[0];

  // Get today's data for the summary section
  const todaySavedData = getTodayData(savedData);

  return (
    <div className="container my-4">
      <h2 className="mb-4">🌍 Daily Carbon Footprint Tracker</h2>

      {/* Category Tabs */}
      <ul className="nav nav-tabs mb-4">
        {categories.map(cat => (
          <li className="nav-item" key={cat}>
            <button
              className={`nav-link ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
              {cat !== "All" && co2ByCategory[cat] > 0 && (
                <span className="badge bg-secondary ms-2">
                  {co2ByCategory[cat].toFixed(1)} kg
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>

      <div className="row">
        {/* Input Form */}
        <div className="col-lg-8">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">Enter Your Daily Activities</h5>
              <CarbonInputForm
                entries={entries}
                setEntries={setEntries}
                activeCategory={activeCategory}
              />

              {/* Live CO2 Display */}
              <div className="alert alert-info mt-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span>
                    <strong>📊 Today's Carbon Footprint:</strong>
                  </span>
                  <span className="fs-4 fw-bold text-success">
                    {calculateTotalCO2()} kg CO2
                  </span>
                </div>
              </div>

              <button
                className="btn btn-success w-100 mt-2"
                onClick={handleSave}
                disabled={loading || calculateTotalCO2() === "0.00"}
              >
                {loading ? "Saving..." : "💾 Save Today's Entries"}
              </button>
            </div>
          </div>
        </div>

        {/* Tips Sidebar */}
        <div className="col-lg-4">
          <div className="card mb-4">
            <div className="card-body">
              <h5 className="card-title">💡 Reduction Tips</h5>
              {activeCategory !== "All" ? (
                <>
                  <p className="text-muted small">
                    Tips to reduce your <strong>{activeCategory}</strong> emissions:
                  </p>
                  <ul className="list-unstyled">
                    {REDUCTION_TIPS[activeCategory]?.map((tip, i) => (
                      <li key={i} className="mb-2 small">{tip}</li>
                    ))}
                  </ul>
                </>
              ) : highestCategory && highestCategory[1] > 0 ? (
                <>
                  <p className="text-muted small">
                    Your highest emissions are from <strong>{highestCategory[0]}</strong>.
                    Here are some tips to reduce:
                  </p>
                  <ul className="list-unstyled">
                    {REDUCTION_TIPS[highestCategory[0]]?.map((tip, i) => (
                      <li key={i} className="mb-2 small">{tip}</li>
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-muted small">
                  Start entering your activities to get personalized tips!
                </p>
              )}
            </div>
          </div>

          {/* Category Breakdown */}
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">📈 By Category</h5>
              {Object.entries(co2ByCategory).map(([cat, value]) => (
                <div key={cat} className="mb-2">
                  <div className="d-flex justify-content-between small">
                    <span>{cat}</span>
                    <span>{value.toFixed(2)} kg</span>
                  </div>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className={`progress-bar ${cat === "Transportation" ? "bg-primary" :
                        cat === "Energy" ? "bg-warning" :
                          cat === "Food" ? "bg-success" : "bg-danger"
                        }`}
                      style={{ width: `${Math.min((value / 20) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <hr />

      {/* Today's Data */}
      <h3 className="mt-4">📊 Today's Carbon Emissions</h3>
      {todaySavedData.length > 0 ? (
        <CarbonSummary data={todaySavedData} />
      ) : (
        <div className="alert alert-info">
          No entries saved for today yet. Enter your activities above and save them!
        </div>
      )}
    </div>
  );
};

export default CarbonTracker;
