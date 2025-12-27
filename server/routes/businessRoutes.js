const express = require("express");
const router = express.Router();
const User = require("../models/User");
const CarbonEntry = require("../models/CarbonEntry");
const Goal = require("../models/Goal");
const Notification = require("../models/Notification");
const authMiddleware = require("../middlewares/authMiddleware");

// Weekly carbon limit (average human: ~12 tons/year = ~230 kg/week)
const WEEKLY_CARBON_LIMIT = 230;

// Middleware to check if user is a business account
const businessMiddleware = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== "business") {
            return res.status(403).json({ message: "Business account required" });
        }
        req.businessUser = user;
        next();
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
};

// Get all employees in organization
router.get("/employees", authMiddleware, businessMiddleware, async (req, res) => {
    try {
        const employees = await User.find({
            organizationId: req.user.id
        }).select("-password -otp -otpExpiry");

        // Get carbon data for each employee (last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        const employeeData = await Promise.all(employees.map(async (emp) => {
            const carbonEntries = await CarbonEntry.find({
                userId: emp._id,
                date: { $gte: oneWeekAgo }
            });

            const weeklyCarbon = carbonEntries.reduce((sum, entry) => sum + (entry.calculatedCO2 || 0), 0);
            const goalsCompleted = await Goal.countDocuments({ userId: emp._id, status: "completed" });

            return {
                _id: emp._id,
                name: emp.name,
                email: emp.email,
                weeklyCarbon: parseFloat(weeklyCarbon.toFixed(2)),
                exceedsLimit: weeklyCarbon > WEEKLY_CARBON_LIMIT,
                goalsCompleted,
                createdAt: emp.createdAt
            };
        }));

        // Sort by weekly carbon (highest first)
        employeeData.sort((a, b) => b.weeklyCarbon - a.weeklyCarbon);

        res.json({
            employees: employeeData,
            totalEmployees: employeeData.length,
            weeklyLimit: WEEKLY_CARBON_LIMIT
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch employees" });
    }
});

// Get detailed carbon data for specific employee
router.get("/employee/:userId", authMiddleware, businessMiddleware, async (req, res) => {
    try {
        const employee = await User.findOne({
            _id: req.params.userId,
            organizationId: req.user.id
        }).select("-password -otp -otpExpiry");

        if (!employee) {
            return res.status(404).json({ message: "Employee not found in your organization" });
        }

        // Get carbon entries (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const carbonEntries = await CarbonEntry.find({
            userId: employee._id,
            date: { $gte: thirtyDaysAgo }
        }).sort({ date: -1 });

        // Calculate totals by category
        const byCategory = {};
        let totalCarbon = 0;

        carbonEntries.forEach(entry => {
            const cat = entry.category || "other";
            byCategory[cat] = (byCategory[cat] || 0) + (entry.calculatedCO2 || 0);
            totalCarbon += entry.calculatedCO2 || 0;
        });

        // Get weekly breakdown
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const weeklyCarbon = carbonEntries
            .filter(e => new Date(e.date) >= oneWeekAgo)
            .reduce((sum, e) => sum + (e.calculatedCO2 || 0), 0);

        const goals = await Goal.find({ userId: employee._id });

        res.json({
            employee: {
                _id: employee._id,
                name: employee.name,
                email: employee.email,
                createdAt: employee.createdAt
            },
            carbon: {
                weekly: parseFloat(weeklyCarbon.toFixed(2)),
                monthly: parseFloat(totalCarbon.toFixed(2)),
                exceedsLimit: weeklyCarbon > WEEKLY_CARBON_LIMIT,
                byCategory
            },
            goals: {
                total: goals.length,
                completed: goals.filter(g => g.status === "completed").length,
                pending: goals.filter(g => g.status === "pending").length
            },
            weeklyLimit: WEEKLY_CARBON_LIMIT
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to fetch employee data" });
    }
});

// Send alert notification to employee
router.post("/alert/:userId", authMiddleware, businessMiddleware, async (req, res) => {
    try {
        const { message } = req.body;

        const employee = await User.findOne({
            _id: req.params.userId,
            organizationId: req.user.id
        });

        if (!employee) {
            return res.status(404).json({ message: "Employee not found in your organization" });
        }

        const notification = new Notification({
            userId: employee._id,
            type: "businessAlerts",
            message: message || `📢 Message from ${req.businessUser.organizationName || "your organization"}: You have exceeded the recommended weekly carbon footprint limit. Please review your carbon usage.`
        });

        await notification.save();

        res.json({ message: "Alert sent successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to send alert" });
    }
});

// Get organization join code (business user's ID)
router.get("/join-code", authMiddleware, businessMiddleware, async (req, res) => {
    try {
        res.json({
            joinCode: req.user.id,
            organizationName: req.businessUser.organizationName
        });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Update organization name
router.put("/organization-name", authMiddleware, businessMiddleware, async (req, res) => {
    try {
        const { organizationName } = req.body;
        await User.findByIdAndUpdate(req.user.id, { organizationName });
        res.json({ message: "Organization name updated" });
    } catch (err) {
        res.status(500).json({ message: "Server error" });
    }
});

// Employee joins organization
router.post("/join", authMiddleware, async (req, res) => {
    try {
        const { joinCode } = req.body;

        // Verify join code is a valid business user
        const business = await User.findOne({ _id: joinCode, role: "business" });
        if (!business) {
            return res.status(404).json({ message: "Invalid organization code" });
        }

        // Update user's organizationId
        await User.findByIdAndUpdate(req.user.id, {
            organizationId: business._id
        });

        res.json({
            message: `Successfully joined ${business.organizationName || "organization"}`,
            organizationName: business.organizationName
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to join organization" });
    }
});

module.exports = router;
