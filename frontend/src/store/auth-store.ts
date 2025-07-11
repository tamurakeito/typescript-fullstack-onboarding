import type { Account } from "@/client/types.gen";
import { create } from "zustand";

interface AuthState {
  account: Account | undefined;
  token: string | undefined;
  signIn: (account: Account, token: string) => void;
  signOut: () => void;
  initialize: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  account: undefined,
  token: undefined,
  signIn: (account: Account, token: string) => {
    set({ account, token });
    localStorage.setItem("account", JSON.stringify(account));
    localStorage.setItem("token", token);
  },
  signOut: () => {
    set({ account: undefined, token: undefined });
    localStorage.removeItem("account");
    localStorage.removeItem("token");
  },
  initialize: () => {
    try {
      const storedAccount = localStorage.getItem("account");
      const storedToken = localStorage.getItem("token");

      if (storedAccount && storedToken) {
        const account = JSON.parse(storedAccount) as Account;
        set({ account, token: storedToken });
      }
    } catch (error) {
      console.error("Failed to initialize auth state from localStorage:", error);
      localStorage.removeItem("account");
      localStorage.removeItem("token");
    }
  },
}));
