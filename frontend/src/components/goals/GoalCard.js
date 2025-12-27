import React, { useState } from "react";
import GoalProgress from "./GoalProgress";

const GoalCard = ({ goal, onToggle, onUpdateProgress, onDelete }) => {
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [newProgress, setNewProgress] = useState(goal.currentValue);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleProgressSubmit = () => {
    if (newProgress >= 0) {
      onUpdateProgress(goal._id, parseFloat(newProgress));
      setShowUpdateModal(false);
    }
  };

  const handleDelete = () => {
    onDelete(goal._id);
    setShowDeleteConfirm(false);
  };

  const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
  const isCompleted = goal.status === "completed";
  const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
  const isOverdue = daysLeft < 0 && !isCompleted;
  const isAutoTracked = !!goal.category; // Has category = auto-tracked

  const categoryLabels = {
    electricity: "⚡ Electricity",
    transport: "🚗 Transport",
    flight: "✈️ Flights",
    fuel: "🔥 Fuel",
    food: "🍽️ Food",
    waste: "🗑️ Waste"
  };

  return (
    <>
      <div className={`card mb-3 ${isCompleted ? 'border-success' : isOverdue ? 'border-danger' : ''}`}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start">
            <div className="flex-grow-1">
              <h5 className="card-title">
                {isCompleted && <span className="badge bg-success me-2">✓ Completed</span>}
                {isOverdue && <span className="badge bg-danger me-2">Overdue</span>}
                {goal.title}
              </h5>
              <p className="card-text mb-2">
                <span className="fw-bold">Target:</span> {goal.targetValue} {goal.unit} |
                <span className="fw-bold ms-2">Current:</span> {goal.currentValue} {goal.unit}
              </p>
              <p className="card-text mb-2">
                <small className={`${isOverdue ? 'text-danger' : 'text-muted'}`}>
                  📅 Deadline: {new Date(goal.deadline).toLocaleDateString()}
                  {!isCompleted && (daysLeft >= 0 ? ` (${daysLeft} days left)` : ` (${Math.abs(daysLeft)} days overdue)`)}
                </small>
                {isAutoTracked && (
                  <span className="badge bg-info ms-2">
                    {categoryLabels[goal.category]} - Auto
                  </span>
                )}
              </p>

              {/* Enhanced Progress Bar */}
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-1">
                  <small>Progress</small>
                  <small className="fw-bold">{progress.toFixed(0)}%</small>
                </div>
                <GoalProgress current={goal.currentValue} target={goal.targetValue} />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="d-flex gap-2 flex-wrap">
            <button
              className={`btn btn-sm ${isCompleted ? 'btn-outline-warning' : 'btn-success'}`}
              onClick={() => onToggle(goal._id)}
            >
              {isCompleted ? '↩ Reopen' : '✓ Mark Complete'}
            </button>
            {!isCompleted && (
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => setShowDeleteConfirm(true)}
              >
                🗑️ Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Update Progress Modal */}
      {showUpdateModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update Progress: {goal.title}</h5>
                <button type="button" className="btn-close" onClick={() => setShowUpdateModal(false)}></button>
              </div>
              <div className="modal-body">
                <label className="form-label">Current Progress ({goal.unit})</label>
                <input
                  type="number"
                  className="form-control"
                  value={newProgress}
                  onChange={(e) => setNewProgress(e.target.value)}
                  min="0"
                  max={goal.targetValue * 2}
                />
                <small className="text-muted">Target: {goal.targetValue} {goal.unit}</small>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowUpdateModal(false)}>Cancel</button>
                <button className="btn btn-primary" onClick={handleProgressSubmit}>Save Progress</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Delete Goal</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteConfirm(false)}></button>
              </div>
              <div className="modal-body">
                <p>Are you sure you want to delete "<strong>{goal.title}</strong>"?</p>
                <p className="text-muted">This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
                <button className="btn btn-danger" onClick={handleDelete}>Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default GoalCard;
