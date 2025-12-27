// src/pages/Profile.jsx
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { getMyGoals, getCarbonEntries, getNotifications, saveNotificationSettings, joinOrganization } from "../services/api";
import { toast } from "react-toastify";

const Profile = () => {
  const { user } = useContext(AuthContext);
  const [notificationSettings, setNotificationSettings] = useState({
    goalReminders: true,
    achievementAlerts: true,
    businessAlerts: false,
  });
  const [stats, setStats] = useState({
    totalGoals: 0,
    completedGoals: 0,
    totalCO2Tracked: 0,
    memberSince: "Recently"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [joinCode, setJoinCode] = useState("");
  const [joiningOrg, setJoiningOrg] = useState(false);

  useEffect(() => {
    if (!user) return;
    fetchUserData();
  }, [user]);

  const fetchUserData = async () => {
    try {
      // Fetch goals to calculate stats
      const goals = await getMyGoals();
      const goalsData = goals.data || [];

      // Fetch carbon entries
      const carbonRes = await getCarbonEntries();
      const carbonData = carbonRes.data || [];

      // Fetch notification settings
      const notifRes = await getNotifications();
      if (notifRes.data?.settings) {
        setNotificationSettings({
          goalReminders: notifRes.data.settings.goalReminders ?? true,
          achievementAlerts: notifRes.data.settings.achievementAlerts ?? true,
          businessAlerts: notifRes.data.settings.businessAlerts ?? false,
        });
      }

      // Calculate total CO2 tracked
      const totalCO2 = carbonData.reduce((sum, entry) => sum + (entry.calculatedCO2 || 0), 0);

      setStats({
        totalGoals: goalsData.length,
        completedGoals: goalsData.filter(g => g.status === "completed").length,
        totalCO2Tracked: totalCO2.toFixed(1),
        memberSince: "Dec 2024"
      });

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch user data", error);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, checked } = e.target;
    setNotificationSettings((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveNotificationSettings(notificationSettings);
      toast.success("Settings saved successfully! ✅");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const handleJoinOrganization = async () => {
    if (!joinCode.trim()) {
      toast.warning("Please enter an organization code");
      return;
    }
    try {
      setJoiningOrg(true);
      const res = await joinOrganization(joinCode);
      toast.success(res.data.message || "Successfully joined organization!");
      setJoinCode("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to join organization");
    } finally {
      setJoiningOrg(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row">
        {/* Profile Header */}
        <div className="col-12 mb-4">
          <div className="card bg-success text-white">
            <div className="card-body p-4">
              <div className="d-flex align-items-center">
                <div
                  className="rounded-circle bg-white text-success d-flex align-items-center justify-content-center me-4"
                  style={{ width: "80px", height: "80px", fontSize: "2rem" }}
                >
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                  <h2 className="mb-1">{user?.name || "User"}</h2>
                  <p className="mb-0 opacity-75">
                    📧 {user?.email || "Email not available"}
                  </p>
                  <span className="badge bg-light text-success mt-2">
                    {user?.role === "business" ? "🏢 Business Account" : "🌱 Eco Warrior"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards - Only for regular users */}
        {user?.role !== "business" && (
          <div className="col-12 mb-4">
            <div className="row g-3">
              <div className="col-md-3 col-6">
                <div className="card text-center h-100">
                  <div className="card-body">
                    <h3 className="text-success">{stats.totalGoals}</h3>
                    <small className="text-muted">Total Goals</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-6">
                <div className="card text-center h-100">
                  <div className="card-body">
                    <h3 className="text-success">{stats.completedGoals}</h3>
                    <small className="text-muted">Completed</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-6">
                <div className="card text-center h-100">
                  <div className="card-body">
                    <h3 className="text-success">{stats.totalCO2Tracked}</h3>
                    <small className="text-muted">kg CO2 Tracked</small>
                  </div>
                </div>
              </div>
              <div className="col-md-3 col-6">
                <div className="card text-center h-100">
                  <div className="card-body">
                    <h3 className="text-success">🏆</h3>
                    <small className="text-muted">{stats.memberSince}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="col-12 mb-3">
          <ul className="nav nav-pills">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === "profile" ? "active bg-success" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                👤 Profile Info
              </button>
            </li>
            {user?.role !== "business" && (
              <>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "notifications" ? "active bg-success" : ""}`}
                    onClick={() => setActiveTab("notifications")}
                  >
                    🔔 Notifications
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "achievements" ? "active bg-success" : ""}`}
                    onClick={() => setActiveTab("achievements")}
                  >
                    🏅 Achievements
                  </button>
                </li>
                <li className="nav-item">
                  <button
                    className={`nav-link ${activeTab === "organization" ? "active bg-success" : ""}`}
                    onClick={() => setActiveTab("organization")}
                  >
                    🏢 Organization
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Tab Content */}
        <div className="col-12">
          {activeTab === "profile" && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">📋 Account Information</h5>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={user?.name || ""}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      value={user?.email || "Not available"}
                      disabled
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Account Type</label>
                    <input
                      type="text"
                      className="form-control"
                      value={user?.role === "business" ? "Business" : "Personal"}
                      disabled
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Member Since</label>
                    <input
                      type="text"
                      className="form-control"
                      value={stats.memberSince}
                      disabled
                    />
                  </div>
                </div>
                <div className="alert alert-info">
                  <small>💡 To change your email or password, use the <a href="/forgot-password">Reset Password</a> feature.</small>
                </div>
              </div>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">🔔 Notification Preferences</h5>
              </div>
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-check form-switch mb-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="goalReminders"
                      name="goalReminders"
                      checked={notificationSettings.goalReminders}
                      onChange={handleChange}
                      style={{ width: "50px", height: "25px" }}
                    />
                    <label className="form-check-label ms-2" htmlFor="goalReminders">
                      <strong>Goal Reminders</strong>
                      <br />
                      <small className="text-muted">Get reminded about upcoming goal deadlines</small>
                    </label>
                  </div>

                  <div className="form-check form-switch mb-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="achievementAlerts"
                      name="achievementAlerts"
                      checked={notificationSettings.achievementAlerts}
                      onChange={handleChange}
                      style={{ width: "50px", height: "25px" }}
                    />
                    <label className="form-check-label ms-2" htmlFor="achievementAlerts">
                      <strong>Achievement Alerts</strong>
                      <br />
                      <small className="text-muted">Celebrate when you complete sustainability goals</small>
                    </label>
                  </div>

                  <div className="form-check form-switch mb-4">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      id="businessAlerts"
                      name="businessAlerts"
                      checked={notificationSettings.businessAlerts}
                      onChange={handleChange}
                      style={{ width: "50px", height: "25px" }}
                    />
                    <label className="form-check-label ms-2" htmlFor="businessAlerts">
                      <strong>Business Updates</strong>
                      <br />
                      <small className="text-muted">Receive updates about business sustainability features</small>
                    </label>
                  </div>

                  <button type="submit" className="btn btn-success" disabled={saving}>
                    {saving ? "Saving..." : "💾 Save Preferences"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">🏅 Your Achievements</h5>
              </div>
              <div className="card-body">
                <div className="row g-3">
                  {stats.completedGoals > 0 && (
                    <div className="col-md-4">
                      <div className="card bg-success text-white text-center">
                        <div className="card-body">
                          <div style={{ fontSize: "3rem" }}>🌟</div>
                          <h6>Goal Crusher</h6>
                          <small>Completed {stats.completedGoals} goal(s)</small>
                        </div>
                      </div>
                    </div>
                  )}

                  {parseFloat(stats.totalCO2Tracked) > 0 && (
                    <div className="col-md-4">
                      <div className="card bg-primary text-white text-center">
                        <div className="card-body">
                          <div style={{ fontSize: "3rem" }}>📊</div>
                          <h6>Carbon Tracker</h6>
                          <small>Tracking your footprint</small>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="col-md-4">
                    <div className="card bg-info text-white text-center">
                      <div className="card-body">
                        <div style={{ fontSize: "3rem" }}>🌱</div>
                        <h6>Eco Warrior</h6>
                        <small>Joined the movement</small>
                      </div>
                    </div>
                  </div>

                  {stats.completedGoals === 0 && parseFloat(stats.totalCO2Tracked) === 0 && (
                    <div className="col-12">
                      <div className="alert alert-info text-center">
                        <h5>🎯 Start your sustainability journey!</h5>
                        <p>Complete goals and track your carbon footprint to unlock achievements.</p>
                        <a href="/goals" className="btn btn-success me-2">Set a Goal</a>
                        <a href="/carbon-tracker" className="btn btn-outline-success">Track Carbon</a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "organization" && (
            <div className="card">
              <div className="card-header">
                <h5 className="mb-0">🏢 Join Your Organization</h5>
              </div>
              <div className="card-body">
                <p className="text-muted mb-4">
                  If your employer uses Ecotrackify for business sustainability tracking,
                  enter the organization code they provided to link your account.
                </p>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Organization Join Code</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter your organization's code"
                        value={joinCode}
                        onChange={(e) => setJoinCode(e.target.value)}
                      />
                      <small className="text-muted">Ask your employer for this code</small>
                    </div>
                    <button
                      className="btn btn-success"
                      onClick={handleJoinOrganization}
                      disabled={joiningOrg}
                    >
                      {joiningOrg ? "Joining..." : "🔗 Join Organization"}
                    </button>
                  </div>
                  <div className="col-md-6">
                    <div className="alert alert-info">
                      <h6>📋 What happens when you join?</h6>
                      <ul className="mb-0 small">
                        <li>Your carbon tracking data will be visible to your employer</li>
                        <li>You may receive sustainability tips from your organization</li>
                        <li>Your employer can send you carbon reduction reminders</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div >
    </div >
  );
};

export default Profile;
