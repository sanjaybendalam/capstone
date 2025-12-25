import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-black px-4">
      <Link className="navbar-brand fw-bold text-success" to="/">
        🌱 Ecotrackify
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navMenu"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navMenu">
        {user ? (
          /* Logged In Navigation */
          <>
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link className="nav-link" to="/dashboard">
                  📊 Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/carbon-tracker">
                  🌍 Carbon Tracker
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/goals">
                  🎯 Goals
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/community">
                  🤝 Community
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/notifications">
                  🔔 Notifications
                </Link>
              </li>
              {user.role === "business" && (
                <li className="nav-item">
                  <Link className="nav-link" to="/business/dashboard">
                    🏢 Business
                  </Link>
                </li>
              )}
            </ul>
            <ul className="navbar-nav ms-auto align-items-center">
              <li className="nav-item">
                <span className="nav-link text-light">
                  👋 Hello, {user.name || "User"}
                </span>
              </li>
              <li className="nav-item">
                <Link className="nav-link" to="/profile">
                  ⚙️ Profile
                </Link>
              </li>
              <li className="nav-item ms-2">
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </ul>
          </>
        ) : (
          /* Logged Out Navigation */
          <ul className="navbar-nav ms-auto align-items-center">
            <li className="nav-item">
              <Link className="nav-link text-light" to="/login">
                Login
              </Link>
            </li>
            <li className="nav-item ms-3">
              <Link className="btn btn-success" to="/register">
                Get Started
              </Link>
            </li>
          </ul>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
