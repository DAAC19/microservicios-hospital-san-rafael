import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppChrome from "../components/AppChrome";
import { getUserProfile, logout } from "../services/authService";
import { getUserById, updateUser } from "../services/userService";
import type { User } from "../types/auth";
import type { UserData } from "../types/user";
import "./management.css";

export default function Profile() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserData | null>(null);
  const [form, setForm] = useState<Partial<UserData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    getUserProfile().then(setAuthUser).catch(() => { logout(); navigate("/login"); });
  }, [navigate]);

  const loadProfile = useCallback(async () => {
    if (!authUser) return;
    setLoading(true);
    setError("");
    try {
      const data = await getUserById(authUser.id);
      setProfile(data);
      setForm(data);
    } catch (error) {
      console.warn("No se pudo cargar tu información básica", error);
      setError("No se pudo cargar tu información básica. Vuelve a iniciar sesión si el token es anterior a esta versión.");
    } finally {
      setLoading(false);
    }
  }, [authUser]);

  useEffect(() => {
    if (!authUser) return;
    Promise.resolve().then(() => {
      void loadProfile();
    });
  }, [authUser, loadProfile]);

  const save = async () => {
    if (!authUser || !profile) return;
    if (!form.first_name?.trim() || !form.last_name?.trim() || !form.document?.trim() || !form.phone?.trim()) {
      setError("Todos los campos son obligatorios.");
      return;
    }
    setError("");
    setSuccess("");
    try {
      const updated = await updateUser(authUser.id, {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        document: form.document.trim(),
        phone: form.phone.trim(),
      });
      setProfile(updated);
      setForm(updated);
      setSuccess("Perfil actualizado correctamente.");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (!authUser) return <div className="mg-loading">Cargando...</div>;

  return (
    <AppChrome user={authUser} active="profile">
      <div className="mg-page-header">
        <div>
          <h1 className="mg-page-title">Perfil</h1>
          <p className="mg-page-sub">Información básica del usuario autenticado</p>
        </div>
      </div>

      <div className="mg-card" style={{ maxWidth: 720 }}>
        {loading ? <div className="mg-state">Cargando perfil...</div> : (
          <div className="dev-modal-body">
            {error && <p className="mg-error">{error}</p>}
            {success && <p className="mg-badge active">{success}</p>}
            <label>Nombres<input value={form.first_name || ""} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></label>
            <label>Apellidos<input value={form.last_name || ""} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></label>
            <label>Documento<input value={form.document || ""} onChange={(e) => setForm({ ...form, document: e.target.value })} /></label>
            <label>Teléfono<input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <div>
              <button className="mg-btn-primary" onClick={save} disabled={!profile}>Guardar cambios</button>
            </div>
          </div>
        )}
      </div>
    </AppChrome>
  );
}
