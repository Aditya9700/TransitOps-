import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'Fleet Manager' | 'Dispatcher' | 'Safety Officer' | 'Financial Analyst';

export interface User {
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, role: UserRole) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_ACCOUNTS: Record<string, { name: string; role: UserRole; pass: string }> = {
  'manager@transitops.com': { name: 'Sarah Jenkins', role: 'Fleet Manager', pass: '123456' },
  'dispatcher@transitops.com': { name: 'David Miller', role: 'Dispatcher', pass: '123456' },
  'safety@transitops.com': { name: 'Marcus Vance', role: 'Safety Officer', pass: '123456' },
  'finance@transitops.com': { name: 'Elena Rostova', role: 'Financial Analyst', pass: '123456' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('transitops_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('transitops_user');
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, role: UserRole): Promise<boolean> => {
    // Simulate API network latency
    await new Promise((resolve) => setTimeout(resolve, 800));

    const matchedAccount = DEMO_ACCOUNTS[email.toLowerCase()];
    if (matchedAccount && matchedAccount.role === role) {
      const newUser: User = {
        email: email.toLowerCase(),
        name: matchedAccount.name,
        role: matchedAccount.role,
      };
      setUser(newUser);
      localStorage.setItem('transitops_user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('transitops_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
