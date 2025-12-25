import React, { useState, useEffect, useContext } from "react";
import GoalForm from "../components/goals/GoalForm";
import GoalCard from "../components/goals/GoalCard";
import { createGoal, getMyGoals, toggleGoal, updateGoalProgress, deleteGoal } from "../services/api";
import { toast } from "react-toastify";
import { AuthContext } from "../context/AuthContext";

const Goals = () => {
  const { user } = useContext(AuthContext);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      const res = await getMyGoals();
      setGoals(res.data || []);
    } catch (err) {
      console.error("Error fetching goals:", err);
      toast.error("Failed to fetch goals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSave = async (goalData) => {
    try {
      await createGoal(goalData);
      toast.success("Goal added successfully!");
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to add goal");
    }
  };

  const handleToggle = async (goalId) => {
    try {
      const updatedGoal = await toggleGoal(goalId);
      // Check if goal was completed and show achievement notification
      if (updatedGoal.data?.status === "completed") {
        toast.success("🎉 Congratulations! Goal completed!");
      }
      fetchGoals();
    } catch (err) {
      toast.error("Failed to update goal");
    }
  };

  const handleUpdateProgress = async (goalId, currentValue) => {
    try {
      const updatedGoal = await updateGoalProgress(goalId, currentValue);
      // Check if goal was auto-completed
      if (updatedGoal.data?.status === "completed") {
        toast.success("🎉 Congratulations! You've reached your goal!");
      } else {
        toast.success("Progress updated!");
      }
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update progress");
    }
  };

  const handleDelete = async (goalId) => {
    try {
      await deleteGoal(goalId);
      toast.success("Goal deleted successfully");
      fetchGoals();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete goal");
    }
  };

  // Separate goals by status
  const pendingGoals = goals.filter(g => g.status === "pending");
  const completedGoals = goals.filter(g => g.status === "completed");

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center">🎯 Your Sustainability Goals</h2>

      <GoalForm onSave={handleSave} />

      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="mt-4">
          {goals.length === 0 ? (
            <div className="alert alert-info text-center">
              <h5>No goals yet!</h5>
              <p>Start by adding your first sustainability goal above.</p>
            </div>
          ) : (
            <>
              {/* Pending Goals */}
              {pendingGoals.length > 0 && (
                <>
                  <h5 className="mb-3">📋 Active Goals ({pendingGoals.length})</h5>
                  {pendingGoals.map((goal) => (
                    <GoalCard
                      key={goal._id}
                      goal={goal}
                      onToggle={handleToggle}
                      onUpdateProgress={handleUpdateProgress}
                      onDelete={handleDelete}
                    />
                  ))}
                </>
              )}

              {/* Completed Goals */}
              {completedGoals.length > 0 && (
                <>
                  <h5 className="mb-3 mt-4">🏆 Completed Goals ({completedGoals.length})</h5>
                  {completedGoals.map((goal) => (
                    <GoalCard
                      key={goal._id}
                      goal={goal}
                      onToggle={handleToggle}
                      onUpdateProgress={handleUpdateProgress}
                      onDelete={handleDelete}
                    />
                  ))}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Goals;
