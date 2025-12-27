import React, { useState, useEffect, useRef } from "react";
import { FaBell } from "react-icons/fa";
import { getNotifications, markNotificationsAsRead, deleteAllNotifications } from "../../services/api";
import { Link } from "react-router-dom";
import "./NotificationDropdown.css";

const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);

    // Fetch notifications on mount and when dropdown opens
    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const res = await getNotifications();
            const notifs = res.data?.notifications || [];
            setNotifications(notifs);
            setUnreadCount(notifs.filter((n) => !n.read).length);
        } catch (err) {
            console.error("Error fetching notifications:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleToggle = () => {
        setIsOpen(!isOpen);
    };

    const handleMarkAllRead = async () => {
        try {
            await markNotificationsAsRead();
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read: true }))
            );
            setUnreadCount(0);
        } catch (err) {
            console.error("Error marking notifications as read:", err);
        }
    };

    const handleClearAll = async () => {
        try {
            await deleteAllNotifications();
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            console.error("Error clearing notifications:", err);
        }
    };

    const getNotificationIcon = (type) => {
        switch (type) {
            case "goalReminders":
                return "🎯";
            case "achievementAlerts":
                return "🏆";
            case "businessAlerts":
                return "📊";
            default:
                return "🔔";
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="notification-dropdown-container" ref={dropdownRef}>
            <button
                className="notification-bell-btn"
                onClick={handleToggle}
                aria-label="Notifications"
            >
                <FaBell size={20} />
                {unreadCount > 0 && (
                    <span className="notification-badge">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="notification-dropdown-panel">
                    <div className="notification-dropdown-header">
                        <h6>Notifications</h6>
                        {unreadCount > 0 && (
                            <span className="notification-count-badge">{unreadCount} new</span>
                        )}
                    </div>

                    <div className="notification-dropdown-body">
                        {loading ? (
                            <div className="notification-loading">
                                <div className="spinner-border spinner-border-sm text-success" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="notification-empty">
                                <span className="notification-empty-icon">🔔</span>
                                <p>No notifications yet</p>
                                <small>Complete goals to receive alerts!</small>
                            </div>
                        ) : (
                            <div className="notification-list">
                                {notifications.slice(0, 10).map((notification, index) => (
                                    <div
                                        key={notification._id || index}
                                        className={`notification-item ${!notification.read ? "unread" : ""}`}
                                    >
                                        <div className="notification-icon">
                                            {getNotificationIcon(notification.type)}
                                        </div>
                                        <div className="notification-content">
                                            <p className="notification-message">{notification.message}</p>
                                            <span className="notification-time">
                                                {formatTime(notification.createdAt)}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="notification-dropdown-footer">
                        {notifications.length > 0 ? (
                            <>
                                <div className="notification-footer-actions">
                                    {unreadCount > 0 && (
                                        <button
                                            className="notification-footer-btn"
                                            onClick={handleMarkAllRead}
                                        >
                                            Mark all read
                                        </button>
                                    )}
                                    <button
                                        className="notification-footer-btn notification-clear-btn"
                                        onClick={handleClearAll}
                                    >
                                        Clear all
                                    </button>
                                </div>
                                <Link
                                    to="/notifications"
                                    className="view-all-link"
                                    onClick={() => setIsOpen(false)}
                                >
                                    View all →
                                </Link>
                            </>
                        ) : (
                            <Link
                                to="/goals"
                                className="view-all-link"
                                onClick={() => setIsOpen(false)}
                            >
                                Set goals to get started →
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;


