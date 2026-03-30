"use client";

import { createContext, useContext, useEffect, useState, ReactNode, Dispatch, SetStateAction } from "react";
import { fetchWithAuth } from '@/app/_lib/fetch_client';

interface User {
  id: string;
  email: string;
  activeOrg: {
    id: string;
    role: string;
    name: string;
  } | null;
  role: string;
  orgs: string[];
}

interface AuthContextType {
  user: User | null;
  setUser: Dispatch<SetStateAction<User | null>>;
  loading: boolean;
  logout: () => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    setLoading(true); // Ensure loading is true if refetching
    try {
      const res = await fetchWithAuth("http://localhost:5000/user/me");
      
      if (res.ok) {
        const data = await res.json();
        // Ensure data.user exists based on your backend response structure
        setUser(data.user || data); 
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await fetchWithAuth("http://localhost:5000/auth/logout");
    } catch (error) {
      console.error("Logout Failed",error);
    } finally {
      setUser(null);
      window.location.href = '/'
    }
  }

  useEffect(() => {
    loadUser();
  }, []);

  return (
      <AuthContext.Provider value={{ user, setUser, loading, refetchUser: loadUser, logout }}>
        {children}
      </AuthContext.Provider>
    );
  }

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}