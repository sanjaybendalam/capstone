import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from "recharts";
import {
  getBusinessEmployees,
  getEmployeeDetails,
  sendEmployeeAlert,
  getJoinCode
} from "../services/api";
import { AuthContext } from "../context/AuthContext";

// Weekly carbon limit
const WEEKLY_CARBON_LIMIT = 230;

// Colors for pie chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300'];

const BusinessDashboard = () => {
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchedEmployee, setSearchedEmployee] = useState(null);
  const [showJoinCode, setShowJoinCode] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [orgName, setOrgName] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  const [sendingAlert, setSendingAlert] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetchJoinCode();
  }, []);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const res = await getBusinessEmployees();
      setEmployees(res.data.employees || []);
    } catch (err) {
      console.error("Error fetching employees:", err);
      toast.error("Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  const fetchJoinCode = async () => {
    try {
      const res = await getJoinCode();
      setJoinCode(res.data.joinCode);
      setOrgName(res.data.organizationName || "");
    } catch (err) {
      console.error("Error fetching join code:", err);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setSearchedEmployee(null);
      return;
    }

    const found = employees.find(emp =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (found) {
      try {
        const res = await getEmployeeDetails(found._id);
        setSearchedEmployee(res.data);
      } catch (err) {
        toast.error("Failed to load employee details");
      }
    } else {
      toast.info("No employee found matching your search");
      setSearchedEmployee(null);
    }
  };

  const handleSendAlert = async () => {
    if (!alertMessage.trim() || !searchedEmployee) {
      toast.warning("Please enter a message");
      return;
    }
    try {
      setSendingAlert(true);
      await sendEmployeeAlert(searchedEmployee.employee._id, alertMessage);
      toast.success("Alert sent successfully!");
      setAlertMessage("");
    } catch (err) {
      toast.error("Failed to send alert");
    } finally {
      setSendingAlert(false);
    }
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchedEmployee(null);
  };

  // Stats
  const totalEmployees = employees.length;
  const totalWeeklyCarbon = employees.reduce((sum, emp) => sum + emp.weeklyCarbon, 0);
  const exceedingLimit = employees.filter(emp => emp.exceedsLimit).length;
  const avgCarbon = totalEmployees > 0 ? (totalWeeklyCarbon / totalEmployees).toFixed(1) : 0;

  // Bar chart data - all employees
  const barChartData = employees.map(emp => ({
    name: emp.name.split(' ')[0],
    carbon: emp.weeklyCarbon
  }));

  // Pie chart data - carbon distribution by employee
  const pieChartData = employees.slice(0, 8).map(emp => ({
    name: emp.name.split(' ')[0],
    value: emp.weeklyCarbon
  }));

  return (
    <div className="container-fluid py-4 px-3 px-lg-4">
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
        <div className="mb-3 mb-md-0">
          <h2 className="mb-1">Business Dashboard</h2>
          <p className="text-muted mb-0">{orgName || "Your Organization"}</p>
        </div>
        <button
          className="btn btn-outline-primary"
          onClick={() => setShowJoinCode(!showJoinCode)}
        >
          {showJoinCode ? "Hide" : "Show"} Join Code
        </button>
      </div>

      {/* Join Code Banner */}
      {showJoinCode && (
        <div className="alert alert-info d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-4">
          <div className="mb-2 mb-md-0">
            <strong>Employee Join Code: </strong>
            <code className="ms-2 fs-6 bg-dark text-light px-2 py-1 rounded">{joinCode}</code>
          </div>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => { navigator.clipboard.writeText(joinCode); toast.success("Copied!") }}
          >
            Copy Code
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-lg-3">
          <div className="card bg-primary text-white h-100">
            <div className="card-body text-center py-3">
              <h3 className="mb-1">{totalEmployees}</h3>
              <small>Total Employees</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card bg-success text-white h-100">
            <div className="card-body text-center py-3">
              <h3 className="mb-1">{totalWeeklyCarbon.toFixed(0)} kg</h3>
              <small>Total Weekly CO2</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className={`card ${exceedingLimit > 0 ? 'bg-danger' : 'bg-secondary'} text-white h-100`}>
            <div className="card-body text-center py-3">
              <h3 className="mb-1">{exceedingLimit}</h3>
              <small>Over Limit</small>
            </div>
          </div>
        </div>
        <div className="col-6 col-lg-3">
          <div className="card bg-info text-white h-100">
            <div className="card-body text-center py-3">
              <h3 className="mb-1">{avgCarbon} kg</h3>
              <small>Avg per Employee</small>
            </div>
          </div>
        </div>
      </div>

      {/* Search Section - Separate */}
      <div className="card mb-4">
        <div className="card-header bg-dark text-white">
          <h5 className="mb-0">Search Employee</h5>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-lg-4 mb-3 mb-lg-0">
              <div className="input-group">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter employee name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                />
                <button className="btn btn-primary" onClick={handleSearch}>Search</button>
                {searchTerm && (
                  <button className="btn btn-outline-secondary" onClick={clearSearch}>Clear</button>
                )}
              </div>
            </div>
            <div className="col-lg-8">
              {searchedEmployee ? (
                <div className="bg-light rounded p-3">
                  <div className="row">
                    <div className="col-md-6">
                      <h5 className="mb-2">{searchedEmployee.employee.name}</h5>
                      <p className="text-muted small mb-2">{searchedEmployee.employee.email}</p>
                      <div className="d-flex gap-3 mb-2">
                        <div>
                          <strong className={searchedEmployee.carbon.exceedsLimit ? 'text-danger' : 'text-success'}>
                            {searchedEmployee.carbon.weekly} kg
                          </strong>
                          <small className="d-block text-muted">This Week</small>
                        </div>
                        <div>
                          <strong>{searchedEmployee.carbon.monthly} kg</strong>
                          <small className="d-block text-muted">This Month</small>
                        </div>
                        <div>
                          <strong className={searchedEmployee.carbon.exceedsLimit ? 'text-danger' : 'text-success'}>
                            {searchedEmployee.carbon.exceedsLimit ? 'Over Limit' : 'Good'}
                          </strong>
                          <small className="d-block text-muted">Status</small>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6>Carbon by Category:</h6>
                      <div className="d-flex flex-wrap gap-2">
                        {Object.entries(searchedEmployee.carbon.byCategory || {}).map(([cat, val]) => (
                          <span key={cat} className="badge bg-secondary">{cat}: {val.toFixed(1)} kg</span>
                        ))}
                      </div>
                      {searchedEmployee.carbon.exceedsLimit && (
                        <div className="mt-3">
                          <div className="input-group input-group-sm">
                            <input
                              type="text"
                              className="form-control"
                              placeholder="Send alert message..."
                              value={alertMessage}
                              onChange={(e) => setAlertMessage(e.target.value)}
                            />
                            <button
                              className="btn btn-danger"
                              onClick={handleSendAlert}
                              disabled={sendingAlert}
                            >
                              {sendingAlert ? "..." : "Send Alert"}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-light rounded p-3 text-center text-muted">
                  <p className="mb-0">Search for an employee to view their carbon summary</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row g-4 mb-4">
        {/* Bar Chart - All Employees */}
        <div className="col-lg-8">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Carbon Emissions by Employee</h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-success"></div>
                </div>
              ) : barChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} kg`, 'CO2']} />
                    <Legend />
                    <Bar dataKey="carbon" fill="#3498db" name="Weekly CO2 (kg)" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-5 text-muted">
                  <p>No employee data available</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pie Chart - Distribution */}
        <div className="col-lg-4">
          <div className="card h-100">
            <div className="card-header">
              <h5 className="mb-0">Carbon Distribution</h5>
            </div>
            <div className="card-body d-flex align-items-center justify-content-center">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}kg`}
                      labelLine={false}
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} kg`, 'CO2']} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-muted">No data</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Employee List - Separate Section */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <h5 className="mb-0">All Employees</h5>
          <span className="badge bg-primary">{employees.length} total</span>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-success"></div>
            </div>
          ) : employees.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <p className="mb-1">No employees have joined yet</p>
              <small>Share your join code with employees to get started</small>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Employee</th>
                    <th>Email</th>
                    <th className="text-center">Weekly CO2</th>
                    <th className="text-center">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => (
                    <tr key={emp._id} className={emp.exceedsLimit ? 'table-danger' : ''}>
                      <td>
                        <strong>{emp.name}</strong>
                      </td>
                      <td className="text-muted">{emp.email}</td>
                      <td className="text-center">
                        <span className={`badge ${emp.exceedsLimit ? 'bg-danger' : 'bg-success'}`}>
                          {emp.weeklyCarbon} kg
                        </span>
                      </td>
                      <td className="text-center">
                        {emp.exceedsLimit ? (
                          <span className="text-danger">Over Limit</span>
                        ) : (
                          <span className="text-success">Good</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
