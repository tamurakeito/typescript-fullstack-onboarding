import type { Account } from "@/client/types.gen";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

export const AuthContext = createContext<{
  account: Account | undefined;
  token: string | undefined;
  setAuth: (account?: Account, token?: string) => void;
}>({
  account: undefined,
  token: undefined,
  setAuth: () => {},
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [account, setAccount] = useState<Account | undefined>(undefined);
  const [token, setToken] = useState<string | undefined>(undefined);

  const setAuth = (account?: Account, token?: string) => {
    setAccount(account);
    setToken(token);
  };

  useEffect(() => {
    const account = localStorage.getItem("account");
    const token = localStorage.getItem("token");
    if (account) {
      setAccount(JSON.parse(account));
    }
    if (token) {
      setToken(token);
    }
  }, []);

  useEffect(() => {
    if (account) {
      localStorage.setItem("account", JSON.stringify(account));
    }
  }, [account]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ account, token, setAuth }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
