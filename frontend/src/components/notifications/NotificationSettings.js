import { useState, useEffect } from "react";
import { saveNotificationSettings, getNotifications } from "../../services/api";
import { toast } from "react-toastify";

const NotificationSettings = () => {
  const [settings, setSettings] = useState({
    goalReminders: true,
    achievementAlerts: true,
    businessAlerts: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true);
        const res = await getNotifications();
        if (res.data?.settings) {
          setSettings({
            goalReminders: res.data.settings.goalReminders ?? true,
            achievementAlerts: res.data.settings.achievementAlerts ?? true,
            businessAlerts: res.data.settings.businessAlerts ?? true
          });
        }
      } catch (err) {
        console.error("Error fetching notification settings:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleToggle = (type) => {
    setSettings({ ...settings, [type]: !settings[type] });
  };

  const handleSave = async () => {
    try {
      await saveNotificationSettings(settings);
      toast.success("Settings updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save settings");
    }
  };

  return (
    <div className="container py-4">
      <h2>Notification Settings</h2>
      <div className="form-check">
        <input
          type="checkbox"
          checked={settings.goalReminders}
          onChange={() => handleToggle("goalReminders")}
          className="form-check-input"
          id="goalReminders"
        />
        <label className="form-check-label" htmlFor="goalReminders">
          Goal Reminders
        </label>
      </div>
      <div className="form-check">
        <input
          type="checkbox"
          checked={settings.achievementAlerts}
          onChange={() => handleToggle("achievementAlerts")}
          className="form-check-input"
          id="achievementAlerts"
        />
        <label className="form-check-label" htmlFor="achievementAlerts">
          Achievement Alerts
        </label>
      </div>
      <div className="form-check">
        <input
          type="checkbox"
          checked={settings.businessAlerts}
          onChange={() => handleToggle("businessAlerts")}
          className="form-check-input"
          id="businessAlerts"
        />
        <label className="form-check-label" htmlFor="businessAlerts">
          Business Notifications
        </label>
      </div>

      <button className="btn btn-success mt-3" onClick={handleSave}>
        Save Settings
      </button>
    </div>
  );
};

export default NotificationSettings;
