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

    console.log("Token recibido:", data.token);

    localStorage.setItem("token", data.token);

    navigate("/dashboard");
  } catch (error) {
    console.error(error);
    setError("Usuario o contraseña incorrectos.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Poppins:wght@600;700;800&display=swap');

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
          font-family: 'Sora', sans-serif;
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
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent);
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
          background: radial-gradient(circle, rgba(255, 255, 255, 0.05), transparent);
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
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
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
          box-shadow: 0 10px 30px rgba(13, 110, 253, 0.2);
          animation: none;
        }

        .login-title {
          font-family: 'Poppins', sans-serif;
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
          background: #fee;
          border: 1px solid #fcc;
          color: var(--error);
          padding: 1rem 1.25rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          font-size: 0.95rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          animation: slideUp 0.3s ease-out;
        }

        .error-alert::before {
          content: '⚠️';
          font-size: 1.2rem;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-label {
          display: block;
          font-weight: 600;
          color: var(--dark);
          margin-bottom: 0.65rem;
          font-size: 0.95rem;
          letter-spacing: -0.3px;
        }

        .form-input {
          width: 100%;
          padding: 0.85rem 1.25rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.3s ease;
          background: #f9fafb;
          font-family: 'Sora', sans-serif;
        }

        .form-input:focus {
          outline: none;
          border-color: var(--primary);
          background: white;
          box-shadow: 0 0 0 4px rgba(13, 110, 253, 0.1);
        }

        .form-input::placeholder {
          color: #9ca3af;
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
          font-family: 'Sora', sans-serif;
          letter-spacing: -0.3px;
          box-shadow: 0 10px 30px rgba(13, 110, 253, 0.2);
        }

        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(13, 110, 253, 0.3);
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
          transition: all 0.3s ease;
          font-size: 0.95rem;
          font-family: 'Sora', sans-serif;
        }

        .back-link:hover {
          color: var(--primary-dark);
          gap: 0.5rem;
        }

        .back-link::before {
          content: '← ';
          margin-right: 0.25rem;
        }

        .login-footer-text {
          color: var(--gray);
          font-size: 0.85rem;
          margin-top: 1.5rem;
        }

        .loading-spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin-right: 0.5rem;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 480px) {
          .login-card-body {
            padding: 2rem 1.5rem;
          }

          .login-title {
            font-size: 1.5rem;
          }

          .login-icon {
            width: 70px;
            height: 70px;
            font-size: 2rem;
          }
        }
      `}</style>

      <div className="login-container">
        <div className="login-wrapper">
          <div className="login-card">
            <div className="login-card-body">
              {/* Header */}
              <div className="login-header">
                <img className="login-icon" src={logoHSF} alt="Hospital San Rafael" />
                <h1 className="login-title">Bienvenido</h1>
                <p className="login-subtitle">
                  Inicia sesión para acceder al sistema de monitoreo hospitalario
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="error-alert">
                  {error}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Nombre de usuario</label>
                  <input
                    type="text"
                    name="username"
                    className="form-input"
                    placeholder="ejemplo@hospital.com"
                    value={form.username}
                    onChange={handleChange}
                    required
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contraseña</label>
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
                      Ingresando...
                    </>
                  ) : (
                    "Ingresar al sistema"
                  )}
                </button>
              </form>

              {/* Footer */}
              <div className="login-footer">
                <button
                  className="back-link"
                  onClick={() => navigate("/")}
                >
                  Volver al inicio
                </button>
                <p className="login-footer-text">
                  Hospital San Rafael · Plataforma de microservicios
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
