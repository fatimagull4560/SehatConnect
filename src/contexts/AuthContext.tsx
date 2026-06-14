import React, { createContext, useContext, useState, useEffect } from 'react';

export type UserRole = 'admin' | 'doctor' | 'receptionist' | 'pharmacist' | 'lab_tech' | 'cashier';

export interface User {
  id: string; name: string; email: string; role: UserRole; pin?: string;
}

interface AuthContextType {
  user: User | null; isAuthenticated: boolean; loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<boolean>;
  loginWithPin: (pin: string) => Promise<boolean>;
  logout: () => void;
}

const DEMO_USERS: User[] = [
  { id: '1', name: 'Dr. Ahmed Hassan', email: 'admin@sehatconnect.pk', role: 'admin', pin: '1234' },
  { id: '2', name: 'Dr. Fatima Malik', email: 'doctor@sehatconnect.pk', role: 'doctor', pin: '2345' },
  { id: '3', name: 'Sara Khan', email: 'receptionist@sehatconnect.pk', role: 'receptionist', pin: '3456' },
  { id: '4', name: 'Ali Raza', email: 'pharmacist@sehatconnect.pk', role: 'pharmacist', pin: '4567' },
  { id: '5', name: 'Bilal Ahmed', email: 'lab@sehatconnect.pk', role: 'lab_tech', pin: '5678' },
  { id: '6', name: 'Zara Baloch', email: 'cashier@sehatconnect.pk', role: 'cashier', pin: '6789' },
];

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('sehat_user') || sessionStorage.getItem('sehat_user');
    if (stored) { try { setUser(JSON.parse(stored)); } catch { /* ignore */ } }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string, remember = false): Promise<boolean> => {
    const found = DEMO_USERS.find(u => u.email === email);
    if (found && password === 'password123') {
      setUser(found);
      (remember ? localStorage : sessionStorage).setItem('sehat_user', JSON.stringify(found));
      return true;
    }
    return false;
  };

  const loginWithPin = async (pin: string): Promise<boolean> => {
    const found = DEMO_USERS.find(u => u.pin === pin);
    if (found) { setUser(found); sessionStorage.setItem('sehat_user', JSON.stringify(found)); return true; }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('sehat_user');
    sessionStorage.removeItem('sehat_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, loginWithPin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  admin: ['dashboard', 'patients', 'doctors', 'appointments', 'pharmacy', 'lab', 'billing', 'hospitals', 'transfers', 'reports', 'admin'],
  doctor: ['dashboard', 'patients', 'appointments', 'hospitals', 'transfers'],
  receptionist: ['dashboard', 'patients', 'appointments', 'billing', 'hospitals', 'transfers'],
  pharmacist: ['dashboard', 'pharmacy', 'billing'],
  lab_tech: ['dashboard', 'lab'],
  cashier: ['dashboard', 'billing', 'pharmacy'],
};
