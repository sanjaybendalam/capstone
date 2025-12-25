import React from "react";

const NotificationList = ({ notifications }) => {
    if (!notifications || notifications.length === 0) {
        return (
            <div className="card mb-4">
                <div className="card-body">
                    <h5 className="card-title">📬 Your Notifications</h5>
                    <p className="text-muted">No notifications yet. Complete goals to receive achievement alerts!</p>
                </div>
            </div>
        );
    }

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

    const getNotificationColor = (type) => {
        switch (type) {
            case "goalReminders":
                return "primary";
            case "achievementAlerts":
                return "success";
            case "businessAlerts":
                return "info";
            default:
                return "secondary";
        }
    };

    return (
        <div className="card mb-4">
            <div className="card-body">
                <h5 className="card-title">📬 Your Notifications ({notifications.length})</h5>
                <div className="list-group">
                    {notifications.map((notification, index) => (
                        <div
                            key={notification._id || index}
                            className={`list-group-item list-group-item-action d-flex justify-content-between align-items-start border-start border-4 border-${getNotificationColor(notification.type)}`}
                        >
                            <div className="ms-2 me-auto">
                                <div className="fw-bold">
                                    {getNotificationIcon(notification.type)} {notification.type || "Notification"}
                                </div>
                                <p className="mb-1">{notification.message}</p>
                                <small className="text-muted">
                                    {new Date(notification.createdAt).toLocaleString()}
                                </small>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NotificationList;
