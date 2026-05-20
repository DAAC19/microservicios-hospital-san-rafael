import api from "../api/api";
import type { LoginData, LoginResponse, User } from "../types/auth";
import { normalizeRole } from "../utils/permissions";

interface TokenPayload {
  credential_id?: number | string;
  username?: string;
  role_id?: number | string;
  role?: string;
  exp?: number;
}

type LoginBackendResponse =
  | {
      token: string;
    }
  | [
      {
        token: string;
      },
      number
    ];

const decodeToken = (token: string): TokenPayload => {
  const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
  const parts = cleanToken.split(".");

  if (parts.length !== 3) {
    throw new Error("Token inválido");
  }

  const payload = parts[1];

  const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
  const paddedBase64 = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    "="
  );

  return JSON.parse(atob(paddedBase64));
};

const extractToken = (data: LoginBackendResponse): string => {
  if (Array.isArray(data)) {
    return data[0]?.token;
  }

  return data.token;
};

export const login = async (
  credentials: LoginData
): Promise<LoginResponse> => {
  const response = await api.post<LoginBackendResponse>(
    "/auth/login",
    credentials
  );

  const token = extractToken(response.data);

  if (!token || typeof token !== "string") {
    console.error("Respuesta inesperada del login:", response.data);
    throw new Error("El backend no devolvió un token válido");
  }

  return {
    token,
  };
};

export const logout = () => {
  localStorage.removeItem("token");
};

export const getUserProfile = async (): Promise<User> => {
  const token = localStorage.getItem("token");

  if (!token) {
    throw new Error("Token no encontrado");
  }

  const decoded = decodeToken(token);

  return {
    id: decoded.credential_id || "",
    username: decoded.username || "Usuario",
    role: normalizeRole(decoded.role || "USER"),
    role_name: decoded.role as User["role_name"],
  };
};