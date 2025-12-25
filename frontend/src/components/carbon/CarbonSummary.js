import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AA336A", "#FF4444", "#44AAFF", "#44FFAA"];

const CarbonSummary = ({ data }) => {
  if (!data || data.length === 0) return <p>No carbon entries yet.</p>;

  // Aggregate CO2 by category
  const aggregated = {};
  data.forEach((entry) => {
    const cat = entry.category;
    if (!aggregated[cat]) aggregated[cat] = 0;
    aggregated[cat] += entry.calculatedCO2;
  });

  // Convert to array for recharts
  const chartData = Object.keys(aggregated).map((key) => ({
    name: key,
    value: aggregated[key]
  }));

  return (
    <PieChart width={400} height={400}>
      <Pie
        data={chartData}
        cx={200}
        cy={200}
        label
        outerRadius={150}
        fill="#8884d8"
        dataKey="value"
      >
        {chartData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend />
    </PieChart>
  );
};

export default CarbonSummary;
