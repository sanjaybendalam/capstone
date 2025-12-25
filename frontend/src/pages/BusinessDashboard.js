import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Mock data for employee sustainability metrics (in production, this would come from API)
const MOCK_EMPLOYEES = [
  { id: 1, name: "John Smith", carbonReduction: 45, goalsCompleted: 8, rank: 1 },
  { id: 2, name: "Sarah Johnson", carbonReduction: 38, goalsCompleted: 6, rank: 2 },
  { id: 3, name: "Mike Williams", carbonReduction: 32, goalsCompleted: 5, rank: 3 },
  { id: 4, name: "Emily Brown", carbonReduction: 28, goalsCompleted: 4, rank: 4 },
  { id: 5, name: "David Lee", carbonReduction: 25, goalsCompleted: 3, rank: 5 },
];

const SUSTAINABILITY_RESOURCES = [
  {
    title: "Office Recycling Program",
    description: "Set up recycling stations and educate employees on proper waste sorting",
    icon: "♻️"
  },
  {
    title: "Remote Work Policy",
    description: "Reduce commute emissions by offering flexible work-from-home options",
    icon: "🏠"
  },
  {
    title: "Energy Efficiency Audit",
    description: "Conduct regular energy audits to identify savings opportunities",
    icon: "⚡"
  },
  {
    title: "Green Commute Incentives",
    description: "Offer incentives for cycling, public transport, or carpooling",
    icon: "🚲"
  },
  {
    title: "Sustainability Training",
    description: "Provide employee training on sustainable practices at work and home",
    icon: "📚"
  },
];

const DEPARTMENT_DATA = [
  { name: "Engineering", emissions: 45, reduction: 12 },
  { name: "Marketing", emissions: 30, reduction: 8 },
  { name: "Sales", emissions: 55, reduction: 15 },
  { name: "HR", emissions: 20, reduction: 5 },
  { name: "Operations", emissions: 40, reduction: 10 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

const BusinessDashboard = () => {
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [companyStats, setCompanyStats] = useState({
    totalEmployees: 5,
    totalCarbonReduced: 168,
    avgReductionPerEmployee: 33.6,
    goalsCompleted: 26,
  });
  const [loading, setLoading] = useState(false);

  // Calculate total emissions reduction
  const totalReduction = employees.reduce((sum, emp) => sum + emp.carbonReduction, 0);

  return (
    <div className="container py-4">
      <h2 className="mb-4">🏢 Business Sustainability Dashboard</h2>
      <p className="text-muted mb-4">
        Track your organization's sustainability progress and empower employees to live sustainably.
      </p>

      {/* Company Overview Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h4>{companyStats.totalEmployees}</h4>
              <small>Total Employees</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h4>{companyStats.totalCarbonReduced} kg</h4>
              <small>Total CO2 Reduced</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h4>{companyStats.avgReductionPerEmployee.toFixed(1)} kg</h4>
              <small>Avg per Employee</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-warning">
            <div className="card-body text-center">
              <h4>{companyStats.goalsCompleted}</h4>
              <small>Goals Completed</small>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        {/* Employee Leaderboard */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0">🏆 Employee Sustainability Leaderboard</h5>
            </div>
            <div className="card-body">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Employee</th>
                    <th>CO2 Reduced</th>
                    <th>Goals</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp.id}>
                      <td>
                        {emp.rank === 1 && "🥇"}
                        {emp.rank === 2 && "🥈"}
                        {emp.rank === 3 && "🥉"}
                        {emp.rank > 3 && `#${emp.rank}`}
                      </td>
                      <td>{emp.name}</td>
                      <td>
                        <span className="badge bg-success">{emp.carbonReduction} kg</span>
                      </td>
                      <td>{emp.goalsCompleted}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Department Comparison Chart */}
        <div className="col-lg-6 mb-4">
          <div className="card h-100">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">📊 Department Sustainability</h5>
            </div>
            <div className="card-body">
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={DEPARTMENT_DATA}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="emissions" fill="#ff6b6b" name="Emissions (kg)" />
                  <Bar dataKey="reduction" fill="#51cf66" name="Reduction (kg)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Sustainability Resources */}
      <div className="card mb-4">
        <div className="card-header bg-info text-white">
          <h5 className="mb-0">📚 Sustainability Resources for Businesses</h5>
        </div>
        <div className="card-body">
          <div className="row">
            {SUSTAINABILITY_RESOURCES.map((resource, index) => (
              <div className="col-md-4 mb-3" key={index}>
                <div className="card h-100">
                  <div className="card-body">
                    <h5>
                      {resource.icon} {resource.title}
                    </h5>
                    <p className="text-muted small">{resource.description}</p>
                    <button className="btn btn-outline-primary btn-sm">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Permission Notice */}
      <div className="alert alert-info">
        <strong>🔒 Privacy Notice:</strong> Employee sustainability data is anonymized and aggregated.
        Individual tracking requires employee consent and follows data protection regulations.
      </div>
    </div>
  );
};

export default BusinessDashboard;
