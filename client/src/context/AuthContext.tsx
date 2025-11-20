import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface User {
  id: string;
  username: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, password: string, email?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, check if token exists in localStorage and restore it
  useEffect(() => {
    const storedToken = localStorage.getItem("hh_token");
    if (storedToken) {
      try {
        // Decode JWT to get user info (basic decoding without verification)
        const parts = storedToken.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          setToken(storedToken);
          setUser({
            id: payload.id,
            username: payload.username,
            role: payload.role,
          });
        } else {
          // Invalid token format, clear it
          localStorage.removeItem("hh_token");
        }
      } catch (e) {
        console.error("Failed to decode token", e);
        localStorage.removeItem("hh_token");
      }
    }
    // Always finish loading, whether token exists or not
    setIsLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    try {
      console.log("[Auth] Attempting login for:", username);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      console.log("[Auth] Login response status:", res.status);

      if (!res.ok) {
        // Try to parse error response as JSON, but fall back to text when necessary
        let body: any = null;
        const contentType = res.headers.get("content-type") || "";
        if (contentType.includes("application/json")) {
          body = await res.json().catch(() => null);
        } else {
          const text = await res.text().catch(() => null);
          if (text) {
            try {
              body = JSON.parse(text);
            } catch {
              body = { raw: text };
            }
          }
        }

        console.error("[Auth] Login error body:", body);
        const errMsg = (body && (body.error || body.message)) || `Login failed (${res.status})`;
        return { success: false, error: errMsg };
      }

      const data = await res.json();
      console.log("[Auth] Login success, token received:", data.token ? "yes" : "no");

      const newToken = data.token;

      // Set token and user immediately
      setToken(newToken);
      localStorage.setItem("hh_token", newToken);

      if (data.user) {
        console.log("[Auth] Setting user:", data.user.username);
        setUser(data.user);
      }

      return { success: true };
    } catch (err: any) {
      console.error("[Auth] Login exception:", err);
      return { success: false, error: err.message };
    }
  };

  const register = async (username: string, password: string, email?: string) => {
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, email }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        return { success: false, error: body.error || "Registration failed" };
      }

      const data = await res.json();
      const newToken = data.token;
      setToken(newToken);
      localStorage.setItem("hh_token", newToken);

      if (data.user) {
        setUser(data.user);
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("hh_token");
  };

  // Create a custom fetch wrapper that automatically includes the Authorization header
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const headers = new Headers(options.headers || {});
    if (token && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    return fetch(url, { ...options, headers });
  };

  // Optionally attach fetchWithAuth globally for convenience
  (window as any).fetchWithAuth = fetchWithAuth;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
