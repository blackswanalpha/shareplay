import { create } from "zustand";
import type { User } from "@/lib/types";
import {
  apiLogin,
  apiRegister,
  apiGetMe,
  storeTokens,
  clearTokens,
  getAccessToken,
} from "@/lib/api";
import { adaptUser } from "@/lib/adapters";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  initialize: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    const token = getAccessToken();
    if (!token) {
      set({ isLoading: false });
      return;
    }
    try {
      const apiUser = await apiGetMe();
      const user = adaptUser(apiUser);
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email: string, password: string) => {
    const tokens = await apiLogin({ email, password });
    storeTokens(tokens.access_token, tokens.refresh_token);
    const apiUser = await apiGetMe();
    const user = adaptUser(apiUser);
    set({ user, isAuthenticated: true });
  },

  register: async (username: string, email: string, password: string) => {
    await apiRegister({ username, email, password });
    // Do NOT auto-login — user must verify email first
  },

  logout: () => {
    clearTokens();
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },
}));
