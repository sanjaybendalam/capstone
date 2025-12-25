import React, { useState, useEffect } from "react";
import NotificationSettings from "../components/notifications/NotificationSettings";
import NotificationList from "../components/notifications/NotificationList";
import { getNotifications } from "../services/api";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("notifications");

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                setLoading(true);
                const res = await getNotifications();
                setNotifications(res.data?.notifications || []);
            } catch (err) {
                console.error("Error fetching notifications:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchNotifications();
    }, []);

    return (
        <div className="container py-4">
            <h2 className="mb-4">🔔 Notifications</h2>

            {/* Tab Navigation */}
            <ul className="nav nav-tabs mb-4">
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === "notifications" ? "active" : ""}`}
                        onClick={() => setActiveTab("notifications")}
                    >
                        Notifications
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${activeTab === "settings" ? "active" : ""}`}
                        onClick={() => setActiveTab("settings")}
                    >
                        Settings
                    </button>
                </li>
            </ul>

            {/* Tab Content */}
            {activeTab === "notifications" ? (
                loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-2 text-muted">Loading notifications...</p>
                    </div>
                ) : (
                    <NotificationList notifications={notifications} />
                )
            ) : (
                <NotificationSettings />
            )}
        </div>
    );
};

export default Notifications;
