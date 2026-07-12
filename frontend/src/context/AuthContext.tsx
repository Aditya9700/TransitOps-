import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'Fleet Manager' | 'Dispatcher' | 'Safety Officer' | 'Financial Analyst';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_ACCOUNTS: Record<string, { name: string; role: UserRole; pass: string }> = {
  'fleet.manager@transitops.dev': { name: 'Aditi Shah', role: 'Fleet Manager', pass: 'Password@123' },
  'dispatcher@transitops.dev': { name: 'Rohit Mehta', role: 'Dispatcher', pass: 'Password@123' },
  'safety@transitops.dev': { name: 'Nina Rao', role: 'Safety Officer', pass: 'Password@123' },
  'finance@transitops.dev': { name: 'Karan Patel', role: 'Financial Analyst', pass: 'Password@123' },
};

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('transitops_user');
    const storedToken = localStorage.getItem('transitops_token');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setToken(storedToken);
      } catch (e) {
        localStorage.removeItem('transitops_user');
        localStorage.removeItem('transitops_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, role: UserRole): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      return false;
    }

    const payload = await response.json();
    const authenticatedUser = payload?.data?.user as User | undefined;
    const authToken = payload?.data?.token as string | undefined;

    if (!authenticatedUser || !authToken || authenticatedUser.role !== role) {
      return false;
    }

    setUser(authenticatedUser);
    setToken(authToken);
    localStorage.setItem('transitops_user', JSON.stringify(authenticatedUser));
    localStorage.setItem('transitops_token', authToken);
    return true;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('transitops_user');
    localStorage.removeItem('transitops_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
