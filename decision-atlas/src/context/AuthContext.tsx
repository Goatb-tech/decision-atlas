import { createContext, useContext, useState } from "react";
import { loginUser, registerUser } from "../lib/api";
import type { User } from "../lib/types";

type AuthValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
};

const SESSION_KEY = "decision_atlas_session_v1";
const AuthContext = createContext<AuthValue | null>(null);

function normalizeUser(candidate: unknown): User | null {
  if (!candidate || typeof candidate !== "object") {
    return null;
  }

  const value = candidate as Record<string, unknown>;
  const id = typeof value.id === "string" ? value.id.trim() : "";
  const name = typeof value.name === "string" ? value.name.trim() : "";
  const email = typeof value.email === "string" ? value.email.trim() : "";
  const createdAt = typeof value.createdAt === "string" ? value.createdAt : "";

  if (!id || !name || !email || !createdAt) {
    return null;
  }

  return { id, name, email, createdAt };
}

function readStoredUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    const normalized = normalizeUser(parsed);

    if (!normalized && raw) {
      localStorage.removeItem(SESSION_KEY);
    }

    return normalized;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}

function persistUser(user: User | null) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    return;
  }

  localStorage.removeItem(SESSION_KEY);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readStoredUser());

  async function login(email: string, password: string) {
    try {
      const { user: apiUser } = await loginUser({ email, password });
      const normalized = normalizeUser(apiUser);

      if (!normalized) {
        throw new Error("Invalid session payload returned by the server.");
      }

      setUser(normalized);
      persistUser(normalized);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unable to sign in.",
      };
    }
  }

  async function register(name: string, email: string, password: string) {
    try {
      const { user: apiUser } = await registerUser({ name, email, password });
      const normalized = normalizeUser(apiUser);

      if (!normalized) {
        throw new Error("Invalid user payload returned by the server.");
      }

      setUser(normalized);
      persistUser(normalized);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unable to create account.",
      };
    }
  }

  function logout() {
    setUser(null);
    persistUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading: false, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
