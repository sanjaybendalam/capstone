import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {registerUser} from "../services/api";

const Register = () => {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await registerUser(form);
      toast.success("Registration successful");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="auth-card col-md-4">
        <h3 className="text-center mb-4">Register</h3>
        <form onSubmit={submit}>
          <input className="form-control mb-3" placeholder="Name" onChange={e => setForm({ ...form, name: e.target.value })} />
          <input className="form-control mb-3" placeholder="Email" onChange={e => setForm({ ...form, email: e.target.value })} />
          <input type="password" className="form-control mb-3" placeholder="Password" onChange={e => setForm({ ...form, password: e.target.value })} />
          <select
            className="form-control mb-3"
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="user">User / Employee</option>
            <option value="business">Business</option>
          </select>
          <button className="btn btn-success w-100">Create Account</button>
        </form>
      </div>
    </div>
  );
};

export default Register;
