import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AppChrome from "../components/AppChrome";
import api from "../api/api";
import { getUserProfile, logout } from "../services/authService";
import { createUser, deleteUser, getUsers, updateUser } from "../services/userService";
import type { User } from "../types/auth";
import type { UserData } from "../types/user";
import "./management.css";

const emptyForm: Partial<UserData> = { first_name: "", last_name: "", document: "", phone: "" };
const emptyCredentialsForm = {
  user_id: "",
  username: "",
  password: "",
  confirmPassword: "",
  role_id: "2",
};

const roleOptions = [
  { id: "1", label: "Administrator (ADMIN)" },
  { id: "2", label: "User (USER)" },
  { id: "3", label: "Supervisor (SUPERVISOR)" },
  { id: "4", label: "Technician (TECHNICIAN)" },
] as const;

const roleNameToIdMap: Record<string, string> = {
  ADMIN: "1",
  USER: "2",
  SUPERVISOR: "3",
  TECHNICIAN: "4",
  TECNICIAN: "4",
};

export default function Users() {
  const navigate = useNavigate();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<UserData | null>(null);
  const [form, setForm] = useState<Partial<UserData>>(emptyForm);
  const [modal, setModal] = useState<"create" | "edit" | "details" | "credentials" | null>(null);
  const [formError, setFormError] = useState("");
  const [credentialsForm, setCredentialsForm] = useState(emptyCredentialsForm);
  const [credentialsError, setCredentialsError] = useState("");
  const [credentialsSuccess, setCredentialsSuccess] = useState("");
  const [credentialsSubmitting, setCredentialsSubmitting] = useState(false);

  useEffect(() => {
    getUserProfile().then((profile) => {
      if (profile.role !== "admin") {
        navigate("/dashboard");
        return;
      }
      setAuthUser(profile);
    }).catch(() => { logout(); navigate("/login"); });
  }, [navigate]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await getUsers());
    } catch (err) {
      console.warn("Could not load users", err);
      setError((err as Error).message || "Could not load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authUser) {
      Promise.resolve().then(() => { void loadUsers(); });
    }
  }, [authUser, loadUsers]);

  const openModal = (mode: "create" | "edit" | "details", item?: UserData) => {
    setSelected(item || null);
    setForm(item ? { ...item } : emptyForm);
    setFormError("");
    setModal(mode);
  };

  const openCredentialsModal = (item?: UserData) => {
    const roleName = String(item?.role_name || "").toUpperCase();
    const role_id = roleNameToIdMap[roleName] || "2";
    setSelected(item || null);
    setCredentialsForm({
      ...emptyCredentialsForm,
      user_id: item ? String(item.id) : "",
      role_id,
    });
    setCredentialsError("");
    setCredentialsSuccess("");
    setModal("credentials");
  };

  const save = async () => {
    if (!form.first_name?.trim() || !form.last_name?.trim() || !form.document?.trim() || !form.phone?.trim()) {
      setFormError("All fields are required.");
      return;
    }
    try {
      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        document: form.document.trim(),
        phone: form.phone.trim(),
      };
      if (modal === "edit" && selected) {
        const updated = await updateUser(selected.id, payload);
        setUsers((prev) => prev.map((item) => String(item.id) === String(updated.id) ? updated : item));
      } else {
        const created = await createUser(payload);
        setUsers((prev) => [created, ...prev]);
      }
      setModal(null);
    } catch (err) {
      setFormError((err as Error).message);
    }
  };

  const remove = async (item: UserData) => {
    if (!window.confirm(`Delete ${item.first_name} ${item.last_name}?`)) return;
    await deleteUser(item.id);
    setUsers((prev) => prev.filter((user) => String(user.id) !== String(item.id)));
  };

  const registerCredentials = async () => {
    if (authUser?.role !== "admin") {
      setCredentialsError("Only administrators can register credentials.");
      return;
    }
    if (!credentialsForm.user_id || !credentialsForm.username.trim() || !credentialsForm.password || !credentialsForm.confirmPassword) {
      setCredentialsError("All fields are required.");
      return;
    }
    if (credentialsForm.password.length < 6) {
      setCredentialsError("Password must be at least 6 characters.");
      return;
    }
    if (credentialsForm.password !== credentialsForm.confirmPassword) {
      setCredentialsError("Passwords do not match.");
      return;
    }

    setCredentialsSubmitting(true);
    setCredentialsError("");
    setCredentialsSuccess("");

    try {
      await api.post("/auth/register", {
        user_id: Number(credentialsForm.user_id),
        username: credentialsForm.username.trim(),
        password: credentialsForm.password,
        role_id: Number(credentialsForm.role_id),
      });
      setCredentialsSuccess("Credentials registered successfully.");
      setCredentialsForm((prev) => ({ ...prev, username: "", password: "", confirmPassword: "" }));
    } catch (err) {
      setCredentialsError((err as Error).message || "Could not register credentials.");
    } finally {
      setCredentialsSubmitting(false);
    }
  };

  if (!authUser) return <div className="mg-loading">Loading...</div>;

  return (
    <AppChrome user={authUser} active="users">
      <div className="mg-page-header">
        <div>
          <h1 className="mg-page-title">Users</h1>
          <p className="mg-page-sub">Basic information management. Credentials do not expose passwords or hashes.</p>
        </div>
        <div className="mg-header-actions">
          {authUser.role === "admin" && (
            <button className="mg-btn-secondary" onClick={() => openCredentialsModal()}>
              + Register credentials
            </button>
          )}
          <button className="mg-btn-primary" onClick={() => openModal("create")}>+ New user</button>
        </div>
      </div>

      <div className="mg-card">
        {loading ? (
          <div className="mg-state">Loading users...</div>
        ) : error ? (
          <div className="mg-error">{error}</div>
        ) : (
          <div className="mg-table-wrap">
            <table className="mg-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Document</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((item) => (
                  <tr key={item.id}>
                    <td className="mg-mono">{item.id}</td>
                    <td className="mg-name">{item.first_name} {item.last_name}</td>
                    <td>{item.document}</td>
                    <td>{item.phone}</td>
                    <td className="mg-actions">
                      {authUser.role === "admin" && (
                        <button className="mg-btn-secondary" onClick={() => openCredentialsModal(item)}>Credentials</button>
                      )}
                      <button className="mg-btn-secondary" onClick={() => openModal("details", item)}>View</button>
                      <button className="mg-btn-edit" onClick={() => openModal("edit", item)}>Edit</button>
                      <button className="mg-btn-danger" onClick={() => remove(item)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && (
        <div className="dev-overlay" onClick={() => setModal(null)}>
          <div className="dev-modal" onClick={(e) => e.stopPropagation()}>
            <div className="dev-modal-head">
              <h2 className="dev-modal-title">
                {modal === "details"
                  ? "User information"
                  : modal === "edit"
                  ? "Edit user"
                  : modal === "credentials"
                  ? "Register credentials"
                  : "New user"}
              </h2>
              <button className="dev-modal-close" onClick={() => setModal(null)}>✕</button>
            </div>

            <div className="dev-modal-body">
              {modal === "credentials" ? (
                <>
                  {credentialsError   && <p className="mg-error">{credentialsError}</p>}
                  {credentialsSuccess && <p className="mg-state">{credentialsSuccess}</p>}
                  <label>
                    User
                    <select
                      value={credentialsForm.user_id}
                      onChange={(e) => setCredentialsForm({ ...credentialsForm, user_id: e.target.value })}
                    >
                      <option value="">Select a user</option>
                      {users.map((item) => (
                        <option key={item.id} value={String(item.id)}>
                          {item.first_name} {item.last_name} — ID {item.id}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Role
                    <select
                      value={credentialsForm.role_id}
                      onChange={(e) => setCredentialsForm({ ...credentialsForm, role_id: e.target.value })}
                    >
                      {roleOptions.map((role) => (
                        <option key={role.id} value={role.id}>{role.label}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Username
                    <input
                      value={credentialsForm.username}
                      onChange={(e) => setCredentialsForm({ ...credentialsForm, username: e.target.value })}
                    />
                  </label>
                  <label>
                    Password
                    <input
                      type="password"
                      value={credentialsForm.password}
                      onChange={(e) => setCredentialsForm({ ...credentialsForm, password: e.target.value })}
                    />
                  </label>
                  <label>
                    Confirm password
                    <input
                      type="password"
                      value={credentialsForm.confirmPassword}
                      onChange={(e) => setCredentialsForm({ ...credentialsForm, confirmPassword: e.target.value })}
                    />
                  </label>
                </>
              ) : (
                <>
                  {formError && <p className="mg-error">{formError}</p>}
                  <label>First name<input disabled={modal === "details"} value={form.first_name || ""} onChange={(e) => setForm({ ...form, first_name: e.target.value })} /></label>
                  <label>Last name<input  disabled={modal === "details"} value={form.last_name  || ""} onChange={(e) => setForm({ ...form, last_name:  e.target.value })} /></label>
                  <label>Document<input   disabled={modal === "details"} value={form.document   || ""} onChange={(e) => setForm({ ...form, document:   e.target.value })} /></label>
                  <label>Phone<input      disabled={modal === "details"} value={form.phone      || ""} onChange={(e) => setForm({ ...form, phone:      e.target.value })} /></label>
                </>
              )}
            </div>

            <div className="dev-modal-foot">
              <button className="mg-btn-secondary" onClick={() => setModal(null)}>Close</button>
              {modal !== "details" && (
                <button
                  className="mg-btn-primary"
                  onClick={modal === "credentials" ? registerCredentials : save}
                  disabled={credentialsSubmitting}
                >
                  {modal === "credentials" ? "Register" : "Save"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AppChrome>
  );
}