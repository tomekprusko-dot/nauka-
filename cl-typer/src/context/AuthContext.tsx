"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { InvitedUser } from "@/lib/types";
import * as store from "@/lib/store";

interface AuthContextValue {
  user: InvitedUser | null;
  loading: boolean;
  login: (nameOrEmail: string, accessCode: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<InvitedUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setUser(store.getCurrentUser());
    setLoading(false);
  }, []);

  function login(nameOrEmail: string, accessCode: string) {
    const result = store.login(nameOrEmail, accessCode);
    setUser(result);
    return result !== null;
  }

  function logout() {
    store.logout();
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
