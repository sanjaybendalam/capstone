import React, { useState, useEffect } from "react";
import NotificationList from "../components/notifications/NotificationList";
import { getNotifications, cleanupBrokenNotifications } from "../services/api";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

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

    useEffect(() => {
        fetchNotifications();
    }, []);

    const handleCleanup = async () => {
        try {
            const res = await cleanupBrokenNotifications();
            toast.success(res.data?.message || "Cleaned up broken notifications");
            fetchNotifications(); // Refresh the list
        } catch (err) {
            toast.error("Failed to cleanup notifications");
        }
    };

    // Check if there are any broken notifications
    const hasBrokenNotifications = notifications.some(n =>
        n.message?.toLowerCase().includes("undefined")
    );

    return (
        <div className="container py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2 className="mb-0">🔔 All Notifications</h2>
                <div className="d-flex gap-2">
                    {hasBrokenNotifications && (
                        <button
                            className="btn btn-outline-warning btn-sm"
                            onClick={handleCleanup}
                        >
                            🧹 Fix Broken Notifications
                        </button>
                    )}
                    <Link to="/profile" className="btn btn-outline-success btn-sm">
                        ⚙️ Notification Settings
                    </Link>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-5">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2 text-muted">Loading notifications...</p>
                </div>
            ) : (
                <NotificationList notifications={notifications} />
            )}
        </div>
    );
};

export default Notifications;
