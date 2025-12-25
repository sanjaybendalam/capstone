import React, { useState } from "react";

const GoalForm = ({ onSave }) => {
  const [form, setForm] = useState({
    title: "",
    targetValue: "",
    unit: "",
    deadline: ""
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear error when user starts typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate target value - prevent unrealistic goals
    const targetValue = parseFloat(form.targetValue);
    if (targetValue <= 0) {
      newErrors.targetValue = "Target value must be greater than 0";
    } else if (targetValue > 10000) {
      newErrors.targetValue = "Target value seems unrealistic. Please set a more achievable goal (max 10,000)";
    }

    // Validate deadline - must be at least 1 day in future
    const deadline = new Date(form.deadline);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (deadline <= today) {
      newErrors.deadline = "Deadline must be at least 1 day in the future";
    }

    // Validate title
    if (form.title.trim().length < 3) {
      newErrors.title = "Goal title must be at least 3 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    onSave(form);
    setForm({ title: "", targetValue: "", unit: "", deadline: "" });
    setErrors({});
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit} className="goal-form card p-4 mb-4">
      <h5 className="mb-3">Add New Sustainability Goal</h5>
      <div className="mb-3">
        <label>Goal Title</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          className={`form-control ${errors.title ? 'is-invalid' : ''}`}
          placeholder="e.g., Reduce plastic usage"
          required
        />
        {errors.title && <div className="invalid-feedback">{errors.title}</div>}
      </div>
      <div className="row">
        <div className="col-md-6 mb-3">
          <label>Target Value</label>
          <input
            type="number"
            name="targetValue"
            value={form.targetValue}
            onChange={handleChange}
            className={`form-control ${errors.targetValue ? 'is-invalid' : ''}`}
            placeholder="e.g., 100"
            min="1"
            max="10000"
            required
          />
          {errors.targetValue && <div className="invalid-feedback">{errors.targetValue}</div>}
          <small className="text-muted">Set a realistic target (max 10,000)</small>
        </div>
        <div className="col-md-6 mb-3">
          <label>Unit (kg, km, items, etc.)</label>
          <input
            type="text"
            name="unit"
            value={form.unit}
            onChange={handleChange}
            className="form-control"
            placeholder="e.g., kg, km, items"
            required
          />
        </div>
      </div>
      <div className="mb-3">
        <label>Deadline</label>
        <input
          type="date"
          name="deadline"
          value={form.deadline}
          onChange={handleChange}
          className={`form-control ${errors.deadline ? 'is-invalid' : ''}`}
          min={getMinDate()}
          required
        />
        {errors.deadline && <div className="invalid-feedback">{errors.deadline}</div>}
        <small className="text-muted">Must be at least 1 day in the future</small>
      </div>
      <button type="submit" className="btn btn-success">
        ➕ Add Goal
      </button>
    </form>
  );
};

export default GoalForm;
