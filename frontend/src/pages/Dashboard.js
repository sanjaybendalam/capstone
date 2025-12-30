import { useNavigate } from "react-router-dom";
import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getCarbonEntries, getMyGoals, getAchievements } from "../services/api";
import DashboardCharts from "../components/dashboard/DashboardCharts";
import AchievementCard from "../components/dashboard/AchievementCard";
import "../styles/theme.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [carbonData, setCarbonData] = useState([]);
  const [goals, setGoals] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch carbon entries
        const carbonRes = await getCarbonEntries();
        setCarbonData(carbonRes.data || []);

        // Fetch user goals
        const goalsRes = await getMyGoals();
        setGoals(goalsRes.data || []);

        // Fetch achievements
        try {
          const achievementsRes = await getAchievements();
          setAchievements(achievementsRes.data || []);
        } catch (achErr) {
          console.log("Achievements not available:", achErr);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="container py-4">
      <h2 className="mb-4">Welcome to Ecotrackify 🌱</h2>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2 text-muted">Loading your dashboard...</p>
        </div>
      ) : (
        <>
          {/* Charts and Progress Section */}
          <DashboardCharts carbonData={carbonData} goals={goals} />

          {/* Achievements Section */}
          <AchievementCard achievements={achievements} />

          {/* Quick Action Cards */}
          <h5 className="mb-3">Quick Actions</h5>
          <div className="row g-4">
            {/* Carbon Calculator Card */}
            <div className="col-md-4">
              <div
                className="card dashboard-card h-100"
                onClick={() => navigate("/carbon-tracker")}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body">
                  <h5 className="card-title">🌍 Carbon Footprint</h5>
                  <p className="card-text">
                    Calculate and track your carbon emissions.
                  </p>
                  <button className="btn btn-success">
                    Calculate Now →
                  </button>
                </div>
              </div>
            </div>

            {/* Goals Card */}
            <div className="col-md-4">
              <div
                className="card dashboard-card h-100"
                onClick={() => navigate("/goals")}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body">
                  <h5 className="card-title">🎯 Sustainability Goals</h5>
                  <p className="card-text">
                    Set and track your sustainability goals.
                  </p>
                  <button className="btn btn-primary">
                    Manage Goals →
                  </button>
                </div>
              </div>
            </div>

            {/* Notifications Card */}
            <div className="col-md-4">
              <div
                className="card dashboard-card h-100"
                onClick={() => navigate("/notifications")}
                style={{ cursor: "pointer" }}
              >
                <div className="card-body">
                  <h5 className="card-title">🔔 Notifications</h5>
                  <p className="card-text">
                    View reminders and customize notification settings.
                  </p>
                  <button className="btn btn-info text-white">
                    View Notifications →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
