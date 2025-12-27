import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { registerUser } from "../services/api";

const Register = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    dob: "",
    role: "user",
    organizationName: ""
  });
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();

    // Validation
    if (!form.name || !form.email || !form.password) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (form.role === "business" && !form.organizationName) {
      toast.error("Organization name is required for business accounts");
      return;
    }

    try {
      await registerUser(form);
      toast.success("Registration successful! 🎉");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", paddingTop: "20px", paddingBottom: "20px" }}>
      <div className="auth-card col-md-5">
        <h3 className="text-center mb-4">🌱 Create Account</h3>
        <form onSubmit={submit}>
          <div className="mb-3">
            <label className="form-label">Full Name *</label>
            <input
              className="form-control"
              placeholder="Enter your name"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Email Address *</label>
            <input
              type="email"
              className="form-control"
              placeholder="Enter your email"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Phone Number</label>
            <input
              type="tel"
              className="form-control"
              placeholder="Enter phone number"
              value={form.phone}
              onChange={e => setForm({ ...form, phone: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Date of Birth</label>
            <input
              type="date"
              className="form-control"
              value={form.dob}
              onChange={e => setForm({ ...form, dob: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Password *</label>
            <input
              type="password"
              className="form-control"
              placeholder="Create a password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </div>

          <div className="mb-3">
            <label className="form-label">Account Type *</label>
            <select
              className="form-control"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              <option value="user">🌱 Individual / Employee</option>
              <option value="business">🏢 Business / Organization</option>
            </select>
          </div>

          {form.role === "business" && (
            <div className="mb-3">
              <label className="form-label">Organization Name *</label>
              <input
                className="form-control"
                placeholder="Enter your organization's name"
                value={form.organizationName}
                onChange={e => setForm({ ...form, organizationName: e.target.value })}
              />
              <small className="text-muted">
                Employees will join your organization using a unique code after registration.
              </small>
            </div>
          )}

          <button className="btn btn-success w-100 mt-2">Create Account</button>

          <p className="text-center mt-3 text-muted">
            Already have an account? <a href="/login">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;

