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
      console.warn("Could not load your basic information", error);
      setError("Could not load your basic information. Please log in again if your token predates this version.");
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
      setError("All fields are required.");
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
      setSuccess("Profile updated successfully.");
    } catch (err) {
      setError((err as Error).message);
    }
  };

  if (!authUser) return <div className="mg-loading">Loading...</div>;

  return (
    <AppChrome user={authUser} active="profile">
      <div className="mg-page-header">
        <div>
          <h1 className="mg-page-title">Profile</h1>
          <p className="mg-page-sub">Basic information of the authenticated user</p>
        </div>
      </div>

      <div className="mg-card" style={{ maxWidth: 720 }}>
        {loading ? <div className="mg-state">Loading profile...</div> : (
          <div className="dev-modal-body">
            {error && <p className="mg-error">{error}</p>}
            {success && <p className="mg-badge active">{success}</p>}
            <label>First Name<input value={form.first_name || ""} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></label>
            <label>Last Name<input value={form.last_name || ""} onChange={(e) => setForm({ ...form, last_name: e.target.value })} /></label>
            <label>Document<input value={form.document || ""} onChange={(e) => setForm({ ...form, document: e.target.value })} /></label>
            <label>Phone<input value={form.phone || ""} onChange={(e) => setForm({ ...form, phone: e.target.value })} /></label>
            <div>
              <button className="mg-btn-primary" onClick={save} disabled={!profile}>Save changes</button>
            </div>
          </div>
        )}
      </div>
    </AppChrome>
  );
}