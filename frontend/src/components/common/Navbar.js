import { Link, useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  const logout = () => {
    localStorage.clear();          // 🔴 THIS IS STEP 9
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-success px-4">
      <Link className="navbar-brand fw-bold" to="/">
        Ecotrackify 🌱
      </Link>

      <div className="ms-auto">
        {!token ? (
          <>
            <Link className="btn btn-outline-light me-2" to="/login">
              Login
            </Link>
            <Link className="btn btn-light" to="/register">
              Register
            </Link>
          </>
        ) : (
          <>
            {role === "business" && (
              <Link
                className="btn btn-outline-light me-2"
                to="/business/dashboard"
              >
                Business Dashboard
              </Link>
            )}

            {role === "user" && (
              <Link
                className="btn btn-outline-light me-2"
                to="/dashboard"
              >
                Dashboard
              </Link>
            )}

            <button className="btn btn-danger" onClick={logout}>
              Logout
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
