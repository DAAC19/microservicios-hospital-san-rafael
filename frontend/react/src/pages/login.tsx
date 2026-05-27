import { useState, type ChangeEvent, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../services/authService";
import logoHSF from "../assets/logoHSF.jpg";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await login(form);
      console.log("Token received:", data.token);
      localStorage.setItem("token", data.token);
      navigate("/dashboard");
    } catch (error) {
      console.error(error);
      setError("Incorrect username or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=DM+Mono:wght@400;500&family=Fraunces:ital,wght@0,700;0,800;1,700&display=swap');
        @import url('https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@latest/dist/tabler-icons.min.css');

        :root {
          --primary: #0d6efd;
          --primary-dark: #0b5ed7;
          --accent: #ff6b6b;
          --success: #10b981;
          --error: #ef4444;
          --dark: #1f2937;
          --light: #f9fafb;
          --gray: #6b7280;
        }

        * {
          font-family: 'DM Sans', sans-serif;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
          min-height: 100vh;
        }

        .login-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 2rem;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 42%, #084298 100%);
          position: relative;
          overflow: hidden;
        }

        .login-container::before {
          content: '';
          position: absolute;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(255,255,255,0.1), transparent);
          border-radius: 50%;
          top: -100px;
          right: -100px;
          animation: float 6s ease-in-out infinite;
        }

        .login-container::after {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255,255,255,0.05), transparent);
          border-radius: 50%;
          bottom: -50px;
          left: 10%;
          animation: float 8s ease-in-out infinite;
          animation-delay: 1s;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(30px); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }

        .login-wrapper {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 450px;
          animation: slideUp 0.8s ease-out;
        }

        .login-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.3);
          overflow: hidden;
          position: relative;
        }

        .login-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 6px;
          background: linear-gradient(90deg, var(--primary), var(--accent));
        }

        .login-card-body {
          padding: 3rem 2.5rem;
        }

        .login-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .login-icon {
          width: 80px;
          height: 80px;
          background: #fff;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
          object-fit: contain;
          box-shadow: 0 10px 30px rgba(13,110,253,0.2);
        }

        .login-title {
          font-family: 'Fraunces', serif;
          font-size: 1.8rem;
          font-weight: 800;
          color: var(--dark);
          margin-bottom: 0.5rem;
          letter-spacing: -0.5px;
        }

        .login-subtitle {
          color: var(--gray);
          font-size: 0.95rem;
          margin: 0;
          line-height: 1.6;
        }

        .error-alert {
          background: #fff1f2;
          border: 1px solid #fecdd3;
          color: var(--error);
          padding: 1rem 1.25rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.9rem;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          animation: slideUp 0.3s ease-out;
        }

        .error-alert i {
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-weight: 600;
          color: var(--dark);
          margin-bottom: 0.65rem;
          font-size: 0.9rem;
          letter-spacing: -0.2px;
        }

        .form-input {
          width: 100%;
          padding: 0.85rem 1.25rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #f9fafb;
          font-family: 'DM Sans', sans-serif;
          color: var(--dark);
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary);
          background: white;
          box-shadow: 0 0 0 4px rgba(13,110,253,0.1);
        }

        .form-input::placeholder {
          color: #9ca3af;
          font-family: 'DM Mono', monospace;
          font-size: 0.9rem;
        }

        .form-input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .password-wrapper {
          position: relative;
        }

        .submit-button {
          width: 100%;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          margin-top: 0.5rem;
          font-family: 'DM Sans', sans-serif;
          letter-spacing: -0.2px;
          box-shadow: 0 10px 30px rgba(13,110,253,0.2);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(13,110,253,0.3);
        }

        .submit-button:active:not(:disabled) {
          transform: translateY(0);
        }

        .submit-button:disabled {
          opacity: 0.8;
          cursor: not-allowed;
          animation: pulse 1.5s ease-in-out infinite;
        }

        .login-footer {
          text-align: center;
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 1px solid #e5e7eb;
        }

        .back-link {
          background: none;
          border: none;
          color: var(--primary);
          font-weight: 600;
          cursor: pointer;
          text-decoration: none;
          transition: color 0.2s ease;
          font-size: 0.9rem;
          font-family: 'DM Sans', sans-serif;
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
        }

        .back-link:hover {
          color: var(--primary-dark);
        }

        .login-footer-text {
          color: var(--gray);
          font-size: 0.8rem;
          margin-top: 1.25rem;
          font-family: 'DM Mono', monospace;
        }

        .loading-spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .login-card-body { padding: 2rem 1.5rem; }
          .login-title { font-size: 1.5rem; }
          .login-icon { width: 70px; height: 70px; }
        }
      `}</style>

      <div className="login-container">
        <div className="login-wrapper">
          <div className="login-card">
            <div className="login-card-body">

              {/* Header */}
              <div className="login-header">
                <img className="login-icon" src={logoHSF} alt="San Rafael Hospital" />
                <h1 className="login-title">Welcome back</h1>
                <p className="login-subtitle">
                  Sign in to access the hospital monitoring system
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="error-alert">
                  <i className="ti ti-alert-triangle" aria-hidden="true"></i>
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">
                    <i className="ti ti-user" style={{ fontSize: "14px", marginRight: "6px", verticalAlign: "-2px" }} aria-hidden="true"></i>
                    Username
                  </label>
                  <input
                    type="text"
                    name="username"
                    className="form-input"
                    placeholder="user@hospital.com"
                    value={form.username}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <i className="ti ti-lock" style={{ fontSize: "14px", marginRight: "6px", verticalAlign: "-2px" }} aria-hidden="true"></i>
                    Password
                  </label>
                  <div className="password-wrapper">
                    <input
                      type="password"
                      name="password"
                      className="form-input"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={handleChange}
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-button"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="loading-spinner"></span>
                      Signing in…
                    </>
                  ) : (
                    <>
                      <i className="ti ti-login" aria-hidden="true"></i>
                      Sign in to system
                    </>
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="login-footer">
                <button className="back-link" onClick={() => navigate("/")}>
                  <i className="ti ti-arrow-left" aria-hidden="true"></i>
                  Back to home
                </button>
                <p className="login-footer-text">
                  San Rafael Hospital · Microservices platform
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;