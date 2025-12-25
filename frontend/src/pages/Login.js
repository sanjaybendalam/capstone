import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { loginUser } from "../services/api";
import { AuthContext } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email, password });

      // Store token for API calls
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      // Update AuthContext with user data (this makes Navbar update)
      login({
        name: res.data.name,
        email: email, // Store the email used to login
        role: res.data.role,
        _id: res.data._id
      });

      toast.success("Login successful");

      if (res.data.role === "business") {
        navigate("/business/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="auth-card col-md-4">
        <h3 className="text-center mb-4">Login</h3>
        <form onSubmit={submit}>
          <input className="form-control mb-3" placeholder="Email" onChange={e => setEmail(e.target.value)} />
          <input type="password" className="form-control mb-3" placeholder="Password" onChange={e => setPassword(e.target.value)} />
          <button className="btn btn-success w-100">Login</button>
        </form>
        <div className="text-center mt-3">
          <Link to="/forgot-password" className="text-light">Forgot Password?</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
