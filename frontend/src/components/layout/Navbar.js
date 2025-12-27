import { Link, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import NotificationDropdown from "../notifications/NotificationDropdown";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-3 px-lg-4 shadow-sm">
      <Link className="navbar-brand fw-bold" to={user ? (user.role === "business" ? "/business/dashboard" : "/dashboard") : "/"}>
        <span className="text-success">Eco</span>trackify
      </Link>

      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navMenu"
        aria-controls="navMenu"
        aria-expanded="false"
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div className="collapse navbar-collapse" id="navMenu">
        {user ? (
          <>
            <ul className="navbar-nav me-auto">
              {user.role === "business" ? (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/business/dashboard">
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/community">
                      Community
                    </Link>
                  </li>
                </>
              ) : (
                <>
                  <li className="nav-item">
                    <Link className="nav-link" to="/dashboard">
                      Dashboard
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/carbon-tracker">
                      Carbon Tracker
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/goals">
                      Goals
                    </Link>
                  </li>
                  <li className="nav-item">
                    <Link className="nav-link" to="/community">
                      Community
                    </Link>
                  </li>
                </>
              )}
            </ul>
            <ul className="navbar-nav ms-auto align-items-lg-center">
              <li className="nav-item d-none d-lg-block">
                <span className="nav-link text-light">
                  Welcome, {user.name || "User"}
                </span>
              </li>
              {user.role !== "business" && (
                <li className="nav-item">
                  <NotificationDropdown />
                </li>
              )}
              <li className="nav-item">
                <Link className="nav-link" to="/profile">
                  Profile
                </Link>
              </li>
              <li className="nav-item ms-lg-2 mt-2 mt-lg-0">
                <button
                  className="btn btn-outline-light btn-sm w-100"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </li>
            </ul>
          </>
        ) : (
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item">
              <Link className="nav-link" to="/login">
                Login
              </Link>
            </li>
            <li className="nav-item ms-lg-3 mt-2 mt-lg-0">
              <Link className="btn btn-success w-100" to="/register">
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
