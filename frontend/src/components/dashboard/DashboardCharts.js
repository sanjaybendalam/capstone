import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#FF4444", "#44AAFF", "#44FFAA"];

const DashboardCharts = ({ carbonData, goals }) => {
    // Process carbon data for line chart - group by date
    const processLineChartData = () => {
        if (!carbonData || carbonData.length === 0) return [];

        const groupedByDate = {};
        carbonData.forEach(entry => {
            // Handle different date field names and invalid dates
            const dateValue = entry.date || entry.createdAt;
            if (!dateValue) return;

            const dateObj = new Date(dateValue);
            // Check for invalid date
            if (isNaN(dateObj.getTime())) return;

            const dateStr = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });

            if (!groupedByDate[dateStr]) {
                groupedByDate[dateStr] = 0;
            }
            groupedByDate[dateStr] += entry.calculatedCO2 || 0;
        });

        return Object.entries(groupedByDate)
            .map(([date, emissions]) => ({ date, emissions: parseFloat(emissions.toFixed(2)) }))
            .slice(-7); // Last 7 days
    };

    // Process carbon data for pie chart - group by category
    const processPieChartData = () => {
        if (!carbonData || carbonData.length === 0) return [];

        const aggregated = {};
        carbonData.forEach(entry => {
            const cat = entry.category || "Other";
            if (!aggregated[cat]) aggregated[cat] = 0;
            aggregated[cat] += entry.calculatedCO2 || 0;
        });

        return Object.entries(aggregated).map(([name, value]) => ({
            name,
            value: parseFloat(value.toFixed(2))
        }));
    };

    const lineChartData = processLineChartData();
    const pieChartData = processPieChartData();

    return (
        <div className="row mb-4">
            {/* Carbon Emissions Trend */}
            <div className="col-md-6 mb-4">
                <div className="card h-100">
                    <div className="card-body">
                        <h5 className="card-title">📈 Carbon Emissions Trend</h5>
                        {lineChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={lineChartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" fontSize={12} />
                                    <YAxis unit=" kg" fontSize={12} />
                                    <Tooltip formatter={(value) => [`${value} kg CO2`, "Emissions"]} />
                                    <Legend />
                                    <Line
                                        type="monotone"
                                        dataKey="emissions"
                                        stroke="#28a745"
                                        strokeWidth={2}
                                        dot={{ fill: "#28a745" }}
                                        name="CO2 Emissions"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-muted">No carbon data available yet. Start tracking to see your progress!</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Carbon by Category */}
            <div className="col-md-6 mb-4">
                <div className="card h-100">
                    <div className="card-body">
                        <h5 className="card-title">🥧 Emissions by Category</h5>
                        {pieChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={pieChartData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={40}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    >
                                        {pieChartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => [`${value} kg CO2`, "Emissions"]} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-muted">No carbon data available yet.</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Goals Progress Overview */}
            <div className="col-12">
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">🎯 Goals Progress Overview</h5>
                        {goals && goals.length > 0 ? (
                            <div className="row">
                                {goals.slice(0, 4).map((goal) => {
                                    const progress = Math.min((goal.currentValue / goal.targetValue) * 100, 100);
                                    const isCompleted = goal.status === "completed";
                                    return (
                                        <div key={goal._id} className="col-md-6 col-lg-3 mb-3">
                                            <div className={`card ${isCompleted ? 'border-success' : ''}`}>
                                                <div className="card-body p-3">
                                                    <h6 className="card-title mb-2">
                                                        {isCompleted && <span className="text-success">✓ </span>}
                                                        {goal.title}
                                                    </h6>
                                                    <div className="progress mb-2" style={{ height: "10px" }}>
                                                        <div
                                                            className={`progress-bar ${isCompleted ? 'bg-success' : 'bg-primary'}`}
                                                            role="progressbar"
                                                            style={{ width: `${progress}%` }}
                                                            aria-valuenow={progress}
                                                            aria-valuemin="0"
                                                            aria-valuemax="100"
                                                        />
                                                    </div>
                                                    <small className="text-muted">
                                                        {goal.currentValue} / {goal.targetValue} {goal.unit}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-muted">No goals set yet. Set your first sustainability goal!</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DashboardCharts;
