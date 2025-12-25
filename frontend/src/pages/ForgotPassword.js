import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { forgotPassword, resetPassword } from "../services/api";
import { toast } from "react-toastify";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const sendOtp = async (e) => {
    e.preventDefault();

    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      await forgotPassword({ email });
      toast.success("OTP sent! Check the server console for the OTP code.");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await resetPassword({ email, otp, newPassword: password });
      toast.success("Password reset successful! Please login with your new password.");
      navigate("/login");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6 col-lg-5">
          <div className="card shadow">
            <div className="card-body p-4">
              <h3 className="text-center mb-4">🔐 Reset Password</h3>

              {/* Progress Steps */}
              <div className="d-flex justify-content-center mb-4">
                <div className={`badge ${step >= 1 ? 'bg-success' : 'bg-secondary'} me-2`}>
                  1. Enter Email
                </div>
                <div className={`badge ${step >= 2 ? 'bg-success' : 'bg-secondary'}`}>
                  2. Reset Password
                </div>
              </div>

              {step === 1 ? (
                <form onSubmit={sendOtp}>
                  <div className="mb-3">
                    <label className="form-label">Email Address</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="Enter your registered email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-success w-100"
                    disabled={loading}
                  >
                    {loading ? "Sending..." : "Send OTP"}
                  </button>
                  <div className="text-center mt-3">
                    <small className="text-muted">
                      We'll generate an OTP and display it in the server console.
                    </small>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleReset}>
                  <div className="alert alert-info mb-3">
                    <small>
                      📧 OTP has been generated for <strong>{email}</strong>
                      <br />
                      Check the <strong>server console</strong> for the OTP code.
                    </small>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Enter OTP</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="6-digit OTP from server console"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      maxLength={6}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Enter new password (min 6 characters)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Confirm New Password</label>
                    <input
                      type="password"
                      className="form-control"
                      placeholder="Confirm new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    className="btn btn-success w-100"
                    disabled={loading}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                  <button
                    type="button"
                    className="btn btn-link w-100 mt-2"
                    onClick={() => setStep(1)}
                  >
                    ← Back to Email
                  </button>
                </form>
              )}

              <div className="text-center mt-4">
                <a href="/login" className="text-decoration-none">
                  Remember your password? Login
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
