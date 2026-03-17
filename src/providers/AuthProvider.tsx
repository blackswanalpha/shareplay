"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import type { User } from "@/lib/types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return <>{children}</>;
}

export function useAuth(): AuthContextValue {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isLoading = useAuthStore((s) => s.isLoading);
  const storeLogin = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const storeLogout = useAuthStore((s) => s.logout);
  const router = useRouter();

  const logout = () => {
    storeLogout();
    router.push("/auth");
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    login: storeLogin,
    register,
    logout,
  };
}
