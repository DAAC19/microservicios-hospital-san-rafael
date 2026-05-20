import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const [scrolled, setScrolled] = useState(false);

const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div style={{ background: "#ffffff" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700&family=Poppins:wght@600;700;800&display=swap');

        :root {
          --primary: #0d6efd;
          --primary-dark: #0b5ed7;
          --accent: #ff6b6b;
          --success: #10b981;
          --warning: #f59e0b;
          --dark: #1f2937;
          --light: #f9fafb;
        }

        * {
          font-family: 'Sora', sans-serif;
        }

        html {
          scroll-behavior: smooth;
        }

        .navbar-custom {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        z-index: 1000;
        padding: 1rem 4rem;
        background: linear-gradient(135deg, #063b8f 0%, #052f73 55%, #03265c 100%);
        backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        box-shadow: 0 10px 35px rgba(3, 38, 92, 0.22);
        transition: all 0.3s ease;
        }

        .navbar-custom.scrolled {
        padding: 0.75rem 4rem;
        background: linear-gradient(135deg, #042b68 0%, #03245a 55%, #021a42 100%);
        box-shadow: 0 14px 42px rgba(2, 26, 66, 0.32);
        }

        .navbar-brand {
          font-family: 'Poppins', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          background: linear-gradient(135deg, #ffffff 0%, #f0f0f0 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          letter-spacing: -0.5px;
        }

        .hero-section {
          position: relative;
          min-height: 100vh;
          background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 42%, #084298 100%);
          overflow: hidden;
          display: flex;
          align-items: center;
          color: white;
        }

        .hero-background {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          opacity: 0.3;
        }

        .hero-circle-1 {
          position: absolute;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent);
          border-radius: 50%;
          top: -100px;
          right: -100px;
          animation: float 6s ease-in-out infinite;
        }

        .hero-circle-2 {
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(255, 255, 255, 0.1), transparent);
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

        @keyframes slideLeft {
          from {
            opacity: 0;
            transform: translateX(-50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(50px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .hero-content {
          position: relative;
          z-index: 2;
          animation: slideLeft 0.8s ease-out;
        }

        .hero-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 0.75rem 1.5rem;
          border-radius: 50px;
          font-size: 0.95rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          backdrop-filter: blur(10px);
          animation: slideUp 0.8s ease-out 0.1s both;
        }

        .hero-title {
          font-family: 'Poppins', sans-serif;
          font-size: 3.5rem;
          font-weight: 800;
          line-height: 1.1;
          margin-bottom: 1.5rem;
          letter-spacing: -1px;
          animation: slideUp 0.8s ease-out 0.2s both;
        }

        .hero-description {
          font-size: 1.15rem;
          line-height: 1.8;
          opacity: 0.9;
          margin-bottom: 2rem;
          max-width: 600px;
          animation: slideUp 0.8s ease-out 0.3s both;
        }

        .hero-buttons {
          display: flex;
          gap: 1.5rem;
          flex-wrap: wrap;
          animation: slideUp 0.8s ease-out 0.4s both;
        }

        .btn-primary-custom {
          background: white;
          color: var(--primary);
          border: none;
          padding: 1rem 2.5rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
          text-decoration: none;
          display: inline-block;
        }

        .btn-primary-custom:hover {
          transform: translateY(-4px);
          box-shadow: 0 30px 50px rgba(0, 0, 0, 0.2);
        }

        .btn-secondary-custom {
          background: transparent;
          color: white;
          border: 2px solid white;
          padding: 0.875rem 2.5rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s ease;
          text-decoration: none;
          display: inline-block;
        }

        .btn-secondary-custom:hover {
          background: white;
          color: var(--primary);
          transform: translateY(-4px);
        }

        .hero-card {
          background: rgba(255, 255, 255, 0.95);
          border-radius: 20px;
          padding: 2.5rem;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          animation: slideRight 0.8s ease-out;
          position: relative;
          overflow: hidden;
        }

        .hero-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--primary), var(--accent));
        }

        .stat-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-item {
          background: linear-gradient(135deg, var(--light) 0%, #f3f4f6 100%);
          padding: 1.5rem;
          border-radius: 12px;
          text-align: center;
          transition: all 0.3s ease;
        }

        .stat-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
        }

        .stat-label {
          color: #6b7280;
          font-size: 0.9rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-family: 'Poppins', sans-serif;
          font-size: 2rem;
          font-weight: 800;
          color: var(--dark);
        }

        .modules-section {
          padding: 6rem 2.5rem;
          background: linear-gradient(180deg, white 0%, var(--light) 100%);
          position: relative;
          z-index: 2;
        }

        .section-badge {
          display: inline-block;
          background: var(--primary);
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          color: white;
          padding: 0.6rem 1.2rem;
          border-radius: 50px;
          font-size: 0.85rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .section-title {
          font-family: 'Poppins', sans-serif;
          font-size: 2.8rem;
          font-weight: 800;
          color: var(--dark);
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .section-description {
          color: #6b7280;
          font-size: 1.1rem;
          line-height: 1.8;
          max-width: 500px;
        }

        .modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .module-card {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .module-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: var(--primary);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }

        .module-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
        }

        .module-card:hover::before {
          transform: scaleX(1);
        }

        .module-icon {
          width: 60px;
          height: 60px;
          background: linear-gradient(135deg, var(--primary), var(--primary-dark));
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
          transition: transform 0.3s ease;
        }

        .module-card:hover .module-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .module-title {
          font-family: 'Poppins', sans-serif;
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--dark);
          margin-bottom: 0.75rem;
        }

        .module-description {
          color: #6b7280;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .features-section {
          padding: 5rem 2.5rem;
          background: white;
        }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
          margin-top: 3rem;
        }

        .feature-card {
          background: linear-gradient(135deg, var(--light), white);
          border: 1px solid #e5e7eb;
          padding: 2rem;
          border-radius: 16px;
          transition: all 0.3s ease;
          text-align: center;
        }

        .feature-card:hover {
          border-color: var(--primary);
          box-shadow: 0 10px 30px rgba(13, 110, 253, 0.1);
          transform: translateY(-4px);
        }

        .feature-icon {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .feature-title {
          font-family: 'Poppins', sans-serif;
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--dark);
          margin-bottom: 0.75rem;
        }

        .feature-description {
          color: #6b7280;
          font-size: 0.95rem;
          line-height: 1.6;
        }

        .footer {
          background: linear-gradient(135deg, var(--dark) 0%, #111827 100%);
          color: white;
          padding: 3rem 2.5rem;
          text-align: center;
        }

        .footer-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
          align-items: center;
          justify-content: center;
        }

        .footer-text {
          margin: 0;
        }

        .footer-brand {
          font-family: 'Poppins', sans-serif;
          font-weight: 700;
          font-size: 1.1rem;
        }

        .footer-subtitle {
          color: #9ca3af;
          font-size: 0.95rem;
          margin-top: 0.5rem;
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 2.5rem;
          }

          .section-title {
            font-size: 2rem;
          }

          .hero-buttons {
            flex-direction: column;
          }

          .btn-primary-custom,
          .btn-secondary-custom {
            width: 100%;
            text-align: center;
          }

          .modules-section {
            padding: 3rem 1.5rem;
          }

          .features-section {
            padding: 3rem 1.5rem;
          }
        }
      `}</style>

      {/* Navbar */}
      <nav className={`navbar-custom fixed-top ${scrolled ? "scrolled" : ""}`} style={{
            top: 0,
            left: 0,
            right: 0,
            padding: scrolled ? "0.75rem 2.5rem" : "1rem 2.5rem",
            zIndex: 1000,
        }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span className="navbar-brand">Hospital San Rafael</span>
          <button
            className="btn-primary-custom"
            onClick={() => navigate("/login")}
            style={{ padding: "0.75rem 2rem", fontSize: "0.95rem" }}
          >
            Iniciar sesión
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-background">
          <div className="hero-circle-1"></div>
          <div className="hero-circle-2"></div>
        </div>

        <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2.5rem", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3rem", alignItems: "center" }}>
          {/* Content */}
          <div className="hero-content">
            <div className="hero-badge">🚀 Sistema de monitoreo hospitalario</div>
            <h1 className="hero-title">Gestión inteligente de dispositivos médicos</h1>
            <p className="hero-description">
              Plataforma centralizada para supervisar dispositivos, ubicaciones, métricas, alertas y reportes del Hospital San Rafael mediante una arquitectura moderna basada en microservicios.
            </p>
            <div className="hero-buttons">
              <button
                className="btn-primary-custom"
                onClick={() => navigate("/login")}
              >
                Acceder al sistema
              </button>
              <a href="#modulos" className="btn-secondary-custom">
                Ver módulos
              </a>
            </div>
          </div>

          {/* Card */}
          <div className="hero-card">
            <div style={{ marginBottom: "1.5rem" }}>
              <h3 style={{ fontSize: "1.4rem", fontWeight: "700", color: "var(--dark)", margin: 0, marginBottom: "0.5rem" }}>
                Estado general del sistema
              </h3>
              <p style={{ color: "#9ca3af", margin: 0, fontSize: "0.95rem" }}>Resumen operativo en tiempo real</p>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
              <div></div>
              <span style={{ background: "#10b981", color: "white", padding: "0.5rem 1rem", borderRadius: "50px", fontSize: "0.85rem", fontWeight: "700" }}>
                ✓ Activo
              </span>
            </div>

            <div className="stat-grid">
              <div className="stat-item">
                <div className="stat-label">Dispositivos</div>
                <div className="stat-value">24</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Ubicaciones</div>
                <div className="stat-value">8</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Alertas</div>
                <div className="stat-value" style={{ color: "#f59e0b" }}>3</div>
              </div>
              <div className="stat-item">
                <div className="stat-label">Reportes</div>
                <div className="stat-value">12</div>
              </div>
            </div>

            <div style={{ background: "#eff6ff", border: "1px solid #bfdbfe", color: "#1e40af", padding: "1.5rem", borderRadius: "12px", fontSize: "0.95rem", lineHeight: "1.6" }}>
              <strong>Monitoreo centralizado:</strong> consulta información operativa desde un único panel de administración.
            </div>
          </div>
        </div>
      </section>

      {/* Modules Section */}
      <section id="modulos" className="modules-section">
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ marginBottom: "3rem" }}>
            <span className="section-badge">Módulos principales</span>
            <h2 className="section-title">Control hospitalario organizado por servicios</h2>
            <p className="section-description">
              La plataforma separa las responsabilidades del sistema en módulos independientes, facilitando el mantenimiento, la escalabilidad y la integración con nuevos componentes.
            </p>
          </div>

          <div className="modules-grid">
            <div className="module-card">
              <div className="module-icon">🩺</div>
              <h3 className="module-title">Dispositivos</h3>
              <p className="module-description">
                Registro, consulta y control del estado de los equipos médicos del hospital.
              </p>
            </div>

            <div className="module-card">
              <div className="module-icon">📍</div>
              <h3 className="module-title">Ubicaciones</h3>
              <p className="module-description">
                Organización de áreas, salas y espacios donde se encuentran los dispositivos.
              </p>
            </div>

            <div className="module-card">
              <div className="module-icon">⚠️</div>
              <h3 className="module-title">Alertas</h3>
              <p className="module-description">
                Notificaciones para eventos importantes o condiciones que requieren atención.
              </p>
            </div>

            <div className="module-card">
              <div className="module-icon">📊</div>
              <h3 className="module-title">Reportes</h3>
              <p className="module-description">
                Visualización consolidada de información para apoyar la toma de decisiones.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏗️</div>
              <h3 className="feature-title">Microservicios</h3>
              <p className="feature-description">
                Arquitectura modular, escalable y fácil de mantener.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">🔌</div>
              <h3 className="feature-title">API REST</h3>
              <p className="feature-description">
                Comunicación clara entre frontend, gateway y servicios.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">📈</div>
              <h3 className="feature-title">Dashboard</h3>
              <p className="feature-description">
                Panel central para supervisar la operación del sistema.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div>
            <p className="footer-text footer-brand">Hospital San Rafael</p>
            <p className="footer-text footer-subtitle">
              Sistema de gestión y monitoreo hospitalario
            </p>
          </div>
          <button
            className="btn-primary-custom"
            onClick={() => navigate("/login")}
            style={{ padding: "0.75rem 2rem", fontSize: "0.95rem" }}
          >
            Acceder al sistema
          </button>
        </div>
      </footer>
    </div>
  );
}

export default Home;