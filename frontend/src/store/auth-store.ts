import type { Account } from "@/client/types.gen";
import { create } from "zustand";

interface AuthState {
  account: Account | undefined;
  token: string | undefined;
  signIn: (account: Account, token: string) => void;
  signOut: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  account: undefined,
  token: undefined,
  signIn: (account: Account, token: string) => set({ account, token }),
  signOut: () => set({ account: undefined, token: undefined }),
}));
