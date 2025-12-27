const Goal = require("../models/Goal");
const Notification = require("../models/Notification");

// Check for goals with approaching deadlines and create reminder notifications
const checkDeadlineReminders = async () => {
    try {
        const now = new Date();
        const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

        // Find pending goals with deadlines within the next 3 days
        const upcomingGoals = await Goal.find({
            status: "pending",
            deadline: { $gte: now, $lte: threeDaysFromNow }
        });

        for (const goal of upcomingGoals) {
            const daysLeft = Math.ceil((new Date(goal.deadline) - now) / (1000 * 60 * 60 * 24));

            // Determine reminder type based on days left
            let reminderKey = "";
            let message = "";

            if (daysLeft <= 1) {
                reminderKey = `deadline_1day_${goal._id}`;
                message = `⏰ Deadline Tomorrow! Your goal "${goal.title}" is due tomorrow. Current progress: ${goal.currentValue}/${goal.targetValue} ${goal.unit}`;
            } else if (daysLeft <= 3) {
                reminderKey = `deadline_3days_${goal._id}`;
                message = `📅 Deadline Approaching: Your goal "${goal.title}" is due in ${daysLeft} days. Keep going!`;
            }

            if (reminderKey && message) {
                // Check if we already sent this reminder (avoid duplicates)
                const existingReminder = await Notification.findOne({
                    userId: goal.userId,
                    type: "goalReminders",
                    message: { $regex: goal.title }
                }).sort({ createdAt: -1 });

                // Only send if no reminder in last 24 hours for this goal
                const shouldSend = !existingReminder ||
                    (now - new Date(existingReminder.createdAt)) > 24 * 60 * 60 * 1000;

                if (shouldSend) {
                    const notification = new Notification({
                        userId: goal.userId,
                        type: "goalReminders",
                        message
                    });
                    await notification.save();
                    console.log(`Reminder sent for goal: ${goal.title}`);
                }
            }
        }

        // Also check for overdue goals
        const overdueGoals = await Goal.find({
            status: "pending",
            deadline: { $lt: now }
        });

        for (const goal of overdueGoals) {
            const daysOverdue = Math.ceil((now - new Date(goal.deadline)) / (1000 * 60 * 60 * 24));

            // Check if we already sent overdue reminder recently
            const existingReminder = await Notification.findOne({
                userId: goal.userId,
                type: "goalReminders",
                message: { $regex: "overdue" }
            }).sort({ createdAt: -1 });

            const shouldSend = !existingReminder ||
                (now - new Date(existingReminder.createdAt)) > 24 * 60 * 60 * 1000;

            if (shouldSend) {
                const notification = new Notification({
                    userId: goal.userId,
                    type: "goalReminders",
                    message: `⚠️ Goal Overdue: "${goal.title}" was due ${daysOverdue} day(s) ago. Progress: ${goal.currentValue}/${goal.targetValue} ${goal.unit}`
                });
                await notification.save();
                console.log(`Overdue reminder sent for goal: ${goal.title}`);
            }
        }

        console.log(`Deadline check completed at ${now.toISOString()}`);
    } catch (err) {
        console.error("Error checking deadline reminders:", err);
    }
};

// Start the scheduler - runs every hour
const startReminderScheduler = () => {
    // Run immediately on startup
    checkDeadlineReminders();

    // Then run every hour (3600000 ms)
    setInterval(checkDeadlineReminders, 60 * 60 * 1000);

    console.log("Goal deadline reminder scheduler started");
};

module.exports = { startReminderScheduler, checkDeadlineReminders };
