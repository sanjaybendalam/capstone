import React from "react";

// Category mappings for filtering
const CATEGORY_MAP = {
  Transportation: ["petrol", "diesel", "flightShort", "flightLong"],
  Energy: ["electricity", "lpg"],
  Food: ["beef", "chicken", "rice", "vegetables"],
  Waste: ["waste"]
};

const CarbonInputForm = ({ entries, setEntries, activeCategory = "All" }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    // Prevent negative values
    const numValue = Math.max(0, parseFloat(value) || 0);
    setEntries({
      ...entries,
      [name]: numValue
    });
  };

  const shouldShow = (fieldName) => {
    if (activeCategory === "All") return true;
    return CATEGORY_MAP[activeCategory]?.includes(fieldName) || false;
  };

  return (
    <form className="carbon-form">
      {/* Transportation Section */}
      {(activeCategory === "All" || activeCategory === "Transportation") && (
        <div className="card mb-3">
          <div className="card-header bg-primary text-white">
            <h6 className="mb-0">🚗 Transportation</h6>
          </div>
          <div className="card-body">
            {shouldShow("petrol") && (
              <div className="form-group mb-3">
                <label className="form-label">
                  Petrol (litres/day): <strong>{entries.petrol || 0}</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.1"
                  className="form-range"
                  name="petrol"
                  value={entries.petrol || 0}
                  onChange={handleChange}
                />
                <small className="text-muted">CO2: {((entries.petrol || 0) * 2.31).toFixed(2)} kg</small>
              </div>
            )}

            {shouldShow("diesel") && (
              <div className="form-group mb-3">
                <label className="form-label">
                  Diesel (litres/day): <strong>{entries.diesel || 0}</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.1"
                  className="form-range"
                  name="diesel"
                  value={entries.diesel || 0}
                  onChange={handleChange}
                />
                <small className="text-muted">CO2: {((entries.diesel || 0) * 2.68).toFixed(2)} kg</small>
              </div>
            )}

            {shouldShow("flightShort") && (
              <div className="form-group mb-3">
                <label className="form-label">
                  Short-haul flights (km): <strong>{entries.flightShort || 0}</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="500"
                  step="10"
                  className="form-range"
                  name="flightShort"
                  value={entries.flightShort || 0}
                  onChange={handleChange}
                />
                <small className="text-muted">CO2: {((entries.flightShort || 0) * 0.09).toFixed(2)} kg</small>
              </div>
            )}

            {shouldShow("flightLong") && (
              <div className="form-group mb-3">
                <label className="form-label">
                  Long-haul flights (km): <strong>{entries.flightLong || 0}</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1000"
                  step="10"
                  className="form-range"
                  name="flightLong"
                  value={entries.flightLong || 0}
                  onChange={handleChange}
                />
                <small className="text-muted">CO2: {((entries.flightLong || 0) * 0.15).toFixed(2)} kg</small>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Energy Section */}
      {(activeCategory === "All" || activeCategory === "Energy") && (
        <div className="card mb-3">
          <div className="card-header bg-warning">
            <h6 className="mb-0">⚡ Energy</h6>
          </div>
          <div className="card-body">
            {shouldShow("electricity") && (
              <div className="form-group mb-3">
                <label className="form-label">
                  Electricity (kWh/day): <strong>{entries.electricity || 0}</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="0.5"
                  className="form-range"
                  name="electricity"
                  value={entries.electricity || 0}
                  onChange={handleChange}
                />
                <small className="text-muted">CO2: {((entries.electricity || 0) * 0.82).toFixed(2)} kg</small>
              </div>
            )}

            {shouldShow("lpg") && (
              <div className="form-group mb-3">
                <label className="form-label">
                  LPG/Cooking Gas (kg/day): <strong>{entries.lpg || 0}</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  className="form-range"
                  name="lpg"
                  value={entries.lpg || 0}
                  onChange={handleChange}
                />
                <small className="text-muted">CO2: {((entries.lpg || 0) * 2.98).toFixed(2)} kg</small>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Food Section */}
      {(activeCategory === "All" || activeCategory === "Food") && (
        <div className="card mb-3">
          <div className="card-header bg-success text-white">
            <h6 className="mb-0">🍽️ Food Consumption</h6>
          </div>
          <div className="card-body">
            {shouldShow("beef") && (
              <div className="form-group mb-3">
                <label className="form-label">
                  Beef (kg/day): <strong>{entries.beef || 0}</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  className="form-range"
                  name="beef"
                  value={entries.beef || 0}
                  onChange={handleChange}
                />
                <small className="text-muted">CO2: {((entries.beef || 0) * 27).toFixed(2)} kg ⚠️ High impact!</small>
              </div>
            )}

            {shouldShow("chicken") && (
              <div className="form-group mb-3">
                <label className="form-label">
                  Chicken (kg/day): <strong>{entries.chicken || 0}</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  className="form-range"
                  name="chicken"
                  value={entries.chicken || 0}
                  onChange={handleChange}
                />
                <small className="text-muted">CO2: {((entries.chicken || 0) * 6.9).toFixed(2)} kg</small>
              </div>
            )}

            {shouldShow("rice") && (
              <div className="form-group mb-3">
                <label className="form-label">
                  Rice (kg/day): <strong>{entries.rice || 0}</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  className="form-range"
                  name="rice"
                  value={entries.rice || 0}
                  onChange={handleChange}
                />
                <small className="text-muted">CO2: {((entries.rice || 0) * 4).toFixed(2)} kg</small>
              </div>
            )}

            {shouldShow("vegetables") && (
              <div className="form-group mb-3">
                <label className="form-label">
                  Vegetables (kg/day): <strong>{entries.vegetables || 0}</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.1"
                  className="form-range"
                  name="vegetables"
                  value={entries.vegetables || 0}
                  onChange={handleChange}
                />
                <small className="text-muted">CO2: {((entries.vegetables || 0) * 2).toFixed(2)} kg ✅ Low impact</small>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Waste Section */}
      {(activeCategory === "All" || activeCategory === "Waste") && (
        <div className="card mb-3">
          <div className="card-header bg-danger text-white">
            <h6 className="mb-0">🗑️ Waste</h6>
          </div>
          <div className="card-body">
            {shouldShow("waste") && (
              <div className="form-group mb-3">
                <label className="form-label">
                  General Waste (kg/day): <strong>{entries.waste || 0}</strong>
                </label>
                <input
                  type="range"
                  min="0"
                  max="5"
                  step="0.1"
                  className="form-range"
                  name="waste"
                  value={entries.waste || 0}
                  onChange={handleChange}
                />
                <small className="text-muted">CO2: {((entries.waste || 0) * 1).toFixed(2)} kg</small>
              </div>
            )}
          </div>
        </div>
      )}
    </form>
  );
};

export default CarbonInputForm;
