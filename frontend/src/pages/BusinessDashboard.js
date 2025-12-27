import React, { useState, useEffect, useContext } from "react";
import { toast } from "react-toastify";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import {
  getBusinessEmployees,
  getEmployeeDetails,
  sendEmployeeAlert,
  getJoinCode,
  updateOrganizationName
} from "../services/api";
import { AuthContext } from "../context/AuthContext";

// Weekly carbon limit (average human: ~12 tons/year = ~230 kg/week)
const WEEKLY_CARBON_LIMIT = 230;

const SUSTAINABILITY_RESOURCES = [
  {
    title: "Office Recycling Program",
    description: "Set up recycling stations and educate employees on proper waste sorting"
  },
  {
    title: "Remote Work Policy",
    description: "Reduce commute emissions by offering flexible work-from-home options"
  },
  {
    title: "Green Commute Incentives",
    description: "Offer incentives for cycling, public transport, or carpooling"
  },
];

const BusinessDashboard = () => {
  const { user } = useContext(AuthContext);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [employeeDetails, setEmployeeDetails] = useState(null);
  const [showJoinCode, setShowJoinCode] = useState(false);
  const [joinCode, setJoinCode] = useState("");
  const [orgName, setOrgName] = useState("");
  const [editingOrgName, setEditingOrgName] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [sendingAlert, setSendingAlert] = useState(false);

  // Fetch employees on mount
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

  const handleViewEmployee = async (empId) => {
    try {
      setSelectedEmployee(empId);
      const res = await getEmployeeDetails(empId);
      setEmployeeDetails(res.data);
    } catch (err) {
      toast.error("Failed to load employee details");
    }
  };

  const handleSendAlert = async (empId) => {
    if (!alertMessage.trim()) {
      toast.warning("Please enter a message");
      return;
    }
    try {
      setSendingAlert(true);
      await sendEmployeeAlert(empId, alertMessage);
      toast.success("Alert sent successfully!");
      setAlertMessage("");
      setSelectedEmployee(null);
      setEmployeeDetails(null);
    } catch (err) {
      toast.error("Failed to send alert");
    } finally {
      setSendingAlert(false);
    }
  };

  const handleQuickAlert = async (emp) => {
    try {
      await sendEmployeeAlert(emp._id, `⚠️ Carbon Alert: You have exceeded the weekly limit of ${WEEKLY_CARBON_LIMIT} kg CO2. Current usage: ${emp.weeklyCarbon} kg. Please review your carbon usage.`);
      toast.success(`Alert sent to ${emp.name}`);
    } catch (err) {
      toast.error("Failed to send alert");
    }
  };

  const handleSaveOrgName = async () => {
    try {
      await updateOrganizationName(orgName);
      toast.success("Organization name updated");
      setEditingOrgName(false);
    } catch (err) {
      toast.error("Failed to update organization name");
    }
  };

  // Filter employees by search
  const filteredEmployees = employees.filter(emp =>
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Stats
  const totalEmployees = employees.length;
  const totalWeeklyCarbon = employees.reduce((sum, emp) => sum + emp.weeklyCarbon, 0);
  const exceedingLimit = employees.filter(emp => emp.exceedsLimit).length;
  const totalGoalsCompleted = employees.reduce((sum, emp) => sum + emp.goalsCompleted, 0);

  // Chart data
  const chartData = filteredEmployees.slice(0, 10).map(emp => ({
    name: emp.name.split(' ')[0],
    carbon: emp.weeklyCarbon,
    limit: WEEKLY_CARBON_LIMIT
  }));

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2>Business Sustainability Dashboard</h2>
          <p className="text-muted mb-0">
            {orgName || "Your Organization"}
          </p>
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
        <div className="alert alert-info d-flex justify-content-between align-items-center mb-4">
          <div>
            <strong>Employee Join Code:</strong>
            <code className="ms-2 fs-6 bg-dark text-light px-2 py-1 rounded">{joinCode}</code>
          </div>
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={() => { navigator.clipboard.writeText(joinCode); toast.success("Copied!") }}
          >
            Copy
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-md-3">
          <div className="card bg-primary text-white">
            <div className="card-body text-center">
              <h4>{totalEmployees}</h4>
              <small>Total Employees</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-success text-white">
            <div className="card-body text-center">
              <h4>{totalWeeklyCarbon.toFixed(1)} kg</h4>
              <small>Weekly CO2 (All)</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className={`card ${exceedingLimit > 0 ? 'bg-danger' : 'bg-info'} text-white`}>
            <div className="card-body text-center">
              <h4>{exceedingLimit}</h4>
              <small>Over Limit</small>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card bg-info text-white">
            <div className="card-body text-center">
              <h4>{totalEmployees - exceedingLimit}</h4>
              <small>Under Limit</small>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Employee List */}
      <div className="row">
        <div className="col-lg-7 mb-4">
          <div className="card h-100">
            <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Employee Carbon Tracking</h5>
              <span className="badge bg-light text-dark">{filteredEmployees.length} employees</span>
            </div>
            <div className="card-body">
              {/* Search Bar */}
              <div className="mb-3">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search employee by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-success"></div>
                </div>
              ) : filteredEmployees.length === 0 ? (
                <div className="text-center py-4 text-muted">
                  <p>{employees.length === 0 ? "No employees have joined yet." : "No matching employees found."}</p>
                  {employees.length === 0 && (
                    <small>Share your join code with employees to get started.</small>
                  )}
                </div>
              ) : (
                <div className="table-responsive" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  <table className="table table-hover">
                    <thead className="sticky-top bg-light">
                      <tr>
                        <th>Employee</th>
                        <th>Weekly CO2</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEmployees.map((emp) => (
                        <tr key={emp._id} className={emp.exceedsLimit ? 'table-danger' : ''}>
                          <td>
                            <strong>{emp.name}</strong>
                            <br />
                            <small className="text-muted">{emp.email}</small>
                          </td>
                          <td>
                            <span className={`badge ${emp.exceedsLimit ? 'bg-danger' : 'bg-success'}`}>
                              {emp.weeklyCarbon} kg
                            </span>
                          </td>
                          <td>
                            {emp.exceedsLimit ? (
                              <span className="text-danger">Over Limit</span>
                            ) : (
                              <span className="text-success">Good</span>
                            )}
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-outline-primary me-1"
                              onClick={() => handleViewEmployee(emp._id)}
                            >
                              View
                            </button>
                            {emp.exceedsLimit && (
                              <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleQuickAlert(emp)}
                              >
                                Alert
                              </button>
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

        {/* Chart or Employee Details */}
        <div className="col-lg-5 mb-4">
          {employeeDetails ? (
            <div className="card h-100">
              <div className="card-header bg-info text-white d-flex justify-content-between">
                <h5 className="mb-0">{employeeDetails.employee.name}</h5>
                <button className="btn btn-sm btn-light" onClick={() => { setSelectedEmployee(null); setEmployeeDetails(null) }}>✕</button>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-6">
                    <div className="p-3 bg-light rounded text-center">
                      <h4 className={employeeDetails.carbon.exceedsLimit ? 'text-danger' : 'text-success'}>
                        {employeeDetails.carbon.weekly} kg
                      </h4>
                      <small>This Week</small>
                    </div>
                  </div>
                  <div className="col-6">
                    <div className="p-3 bg-light rounded text-center">
                      <h4>{employeeDetails.carbon.monthly} kg</h4>
                      <small>This Month</small>
                    </div>
                  </div>
                </div>

                <h6>Carbon by Category:</h6>
                <ul className="list-group mb-3">
                  {Object.entries(employeeDetails.carbon.byCategory || {}).map(([cat, val]) => (
                    <li key={cat} className="list-group-item d-flex justify-content-between">
                      <span>{cat}</span>
                      <span className="badge bg-secondary">{val.toFixed(1)} kg</span>
                    </li>
                  ))}
                </ul>

                <h6>Goals:</h6>
                <p>
                  Completed: <strong>{employeeDetails.goals.completed}</strong> |
                  Pending: <strong>{employeeDetails.goals.pending}</strong>
                </p>

                {employeeDetails.carbon.exceedsLimit && (
                  <div className="mt-3">
                    <h6>Send Custom Alert:</h6>
                    <textarea
                      className="form-control mb-2"
                      rows="2"
                      placeholder="Enter your message..."
                      value={alertMessage}
                      onChange={(e) => setAlertMessage(e.target.value)}
                    ></textarea>
                    <button
                      className="btn btn-danger w-100"
                      onClick={() => handleSendAlert(employeeDetails.employee._id)}
                      disabled={sendingAlert}
                    >
                      {sendingAlert ? "Sending..." : "📤 Send Alert"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card h-100">
              <div className="card-header bg-primary text-white">
                <h5 className="mb-0">📊 Employee Carbon Comparison</h5>
              </div>
              <div className="card-body">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={80} fontSize={12} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="carbon" fill="#ff6b6b" name="Weekly CO2 (kg)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-5 text-muted">
                    <p>No employee data to display</p>
                  </div>
                )}
                <div className="text-center mt-2">
                  <small className="text-muted">Weekly limit: {WEEKLY_CARBON_LIMIT} kg CO2</small>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sustainability Resources */}
      <div className="card mb-4">
        <div className="card-header bg-success text-white">
          <h5 className="mb-0">📚 Sustainability Resources</h5>
        </div>
        <div className="card-body">
          <div className="row">
            {SUSTAINABILITY_RESOURCES.map((resource, index) => (
              <div className="col-md-4 mb-3" key={index}>
                <div className="card h-100">
                  <div className="card-body">
                    <h5>{resource.icon} {resource.title}</h5>
                    <p className="text-muted small">{resource.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusinessDashboard;
