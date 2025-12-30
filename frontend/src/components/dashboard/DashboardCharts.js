import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, ReferenceLine } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#FF4444", "#44AAFF", "#44FFAA"];

// Daily carbon emission threshold (kg CO2) - emissions above this trigger warnings
const DAILY_THRESHOLD = 10;

const DashboardCharts = ({ carbonData, goals }) => {
    // Get today's date in sortKey format for comparison
    const getTodaySortKey = () => {
        return new Date().toISOString().split('T')[0];
    };

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

            // Use ISO date format for proper sorting
            const sortKey = dateObj.toISOString().split('T')[0];
            const displayDate = dateObj.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
            });

            if (!groupedByDate[sortKey]) {
                groupedByDate[sortKey] = { date: displayDate, emissions: 0, sortKey };
            }
            groupedByDate[sortKey].emissions += entry.calculatedCO2 || 0;
        });

        // Sort by date and take last 7 days
        return Object.values(groupedByDate)
            .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
            .slice(-7)
            .map(item => ({
                date: item.date,
                sortKey: item.sortKey,
                emissions: parseFloat(item.emissions.toFixed(2)),
                isAboveThreshold: item.emissions > DAILY_THRESHOLD
            }));
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

    // Custom dot renderer for threshold-based coloring
    const CustomDot = (props) => {
        const { cx, cy, payload } = props;
        const color = payload.isAboveThreshold ? "#dc3545" : "#28a745";
        return (
            <circle cx={cx} cy={cy} r={6} fill={color} stroke="#fff" strokeWidth={2} />
        );
    };

    // Custom line stroke that changes color based on threshold
    const getLineGradientId = () => "lineGradient";

    // Static carbon reduction tips
    const reductionTips = [
        { id: 1, tip: "Switch to LED bulbs - they use 75% less energy than incandescent lights." },
        { id: 2, tip: "Unplug electronics when not in use to avoid phantom energy drain." },
        { id: 3, tip: "Use public transport or carpool to reduce your transport emissions." },
        { id: 4, tip: "Reduce meat consumption - plant-based meals have a much lower carbon footprint." },
        { id: 5, tip: "Air dry your clothes instead of using a dryer to save energy." },
        { id: 6, tip: "Use a reusable water bottle and shopping bags to reduce waste." },
        { id: 7, tip: "Set your thermostat 1-2 degrees lower in winter to save heating energy." },
        { id: 8, tip: "Take shorter showers - heating water accounts for significant energy use." },
        { id: 9, tip: "Choose local and seasonal produce to reduce food transportation emissions." },
        { id: 10, tip: "Maintain your vehicle properly - well-tuned cars emit less CO2." },
        { id: 11, tip: "Use natural light during the day instead of artificial lighting." },
        { id: 12, tip: "Recycle and compost to reduce waste going to landfills." }
    ];

    // Get random reduction tips to display (3 tips)
    const getRandomTips = () => {
        const shuffled = [...reductionTips].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    };

    const lineChartData = processLineChartData();
    const pieChartData = processPieChartData();
    const randomTips = getRandomTips();
    const todaySortKey = getTodaySortKey();

    // Check if TODAY's emissions exceed threshold (not historical)
    const todayData = lineChartData.find(d => d.sortKey === todaySortKey);
    const isTodayAboveThreshold = todayData && todayData.isAboveThreshold;

    // Calculate gradient stops for multi-color line
    const calculateGradientStops = () => {
        if (lineChartData.length === 0) return [];

        const stops = [];
        const totalPoints = lineChartData.length;

        lineChartData.forEach((point, index) => {
            const offset = (index / (totalPoints - 1)) * 100;
            const color = point.isAboveThreshold ? "#dc3545" : "#28a745";

            // Add stop for this segment
            if (index > 0) {
                stops.push({ offset: `${offset}%`, color });
            }
            stops.push({ offset: `${offset}%`, color });
        });

        return stops;
    };

    const gradientStops = calculateGradientStops();

    return (
        <div className="row mb-4">
            {/* Carbon Emissions Trend */}
            <div className="col-md-6 mb-4">
                <div className="card h-100">
                    <div className="card-body">
                        <h5 className="card-title">Carbon Emissions Trend</h5>

                        {/* Alert only for TODAY's high emissions */}
                        {isTodayAboveThreshold && (
                            <div className="alert alert-danger py-2 mb-3" role="alert">
                                <strong>Today's Emissions Alert!</strong> You exceeded the daily limit ({DAILY_THRESHOLD} kg CO2) today with {todayData.emissions} kg. Consider reducing your carbon footprint.
                            </div>
                        )}

                        {lineChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={lineChartData}>
                                    <defs>
                                        <linearGradient id={getLineGradientId()} x1="0%" y1="0%" x2="100%" y2="0%">
                                            {gradientStops.map((stop, index) => (
                                                <stop key={index} offset={stop.offset} stopColor={stop.color} />
                                            ))}
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="date" fontSize={12} />
                                    <YAxis unit=" kg" fontSize={12} />
                                    <Tooltip
                                        formatter={(value, name, props) => {
                                            const isHigh = props.payload.isAboveThreshold;
                                            return [
                                                `${value} kg CO2 ${isHigh ? '(ABOVE LIMIT!)' : '(OK)'}`,
                                                "Emissions"
                                            ];
                                        }}
                                    />
                                    <Legend />
                                    {/* Threshold Reference Line */}
                                    <ReferenceLine
                                        y={DAILY_THRESHOLD}
                                        stroke="#dc3545"
                                        strokeDasharray="5 5"
                                        strokeWidth={2}
                                        label={{
                                            value: `Limit: ${DAILY_THRESHOLD} kg`,
                                            position: "right",
                                            fill: "#dc3545",
                                            fontSize: 11
                                        }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="emissions"
                                        stroke={`url(#${getLineGradientId()})`}
                                        strokeWidth={3}
                                        dot={<CustomDot />}
                                        name="CO2 Emissions"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-muted">No carbon data available yet. Start tracking to see your progress!</p>
                        )}

                        {/* Reduction Tips Section - Only show if today is above threshold */}
                        {isTodayAboveThreshold && (
                            <div className="mt-3 pt-3 border-top">
                                <h6 className="text-danger mb-2">💡 Tips to Reduce Your Emissions</h6>
                                <p className="small text-muted mb-2">
                                    You exceeded today's limit! Here are some tips to help:
                                </p>
                                {randomTips.map((item) => (
                                    <div key={item.id} className="mb-2 p-2 bg-light rounded">
                                        <small className="text-dark">
                                            ✓ {item.tip}
                                        </small>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Carbon by Category */}
            <div className="col-md-6 mb-4">
                <div className="card h-100">
                    <div className="card-body">
                        <h5 className="card-title">Emissions by Category</h5>
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
                        <h5 className="card-title">Goals Progress Overview</h5>
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
                                                        {isCompleted && <span className="text-success">Done </span>}
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
