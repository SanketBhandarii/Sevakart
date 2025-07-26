import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  phone: string;
  role: 'vendor' | 'supplier';
  location: string;
}

interface AuthContextType {
  user: User | null;
  login: (phone: string, password: string, role: 'vendor' | 'supplier') => Promise<boolean>;
  register: (userData: {
    name: string;
    phone: string;
    password: string;
    role: 'vendor' | 'supplier';
    location: string;
  }) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem('sevakart_user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (phone: string, password: string, role: 'vendor' | 'supplier'): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple validation for demo
    if (phone.length === 10 && password.length >= 6) {
      const userData: User = {
        id: `${role}_${phone}`,
        name: role === 'vendor' ? 'Ram Kumar' : 'Ramesh Suppliers',
        phone: phone,
        role: role,
        location: 'Delhi'
      };
      
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('sevakart_user', JSON.stringify(userData));
      return true;
    }
    return false;
  };

  const register = async (userData: {
    name: string;
    phone: string;
    password: string;
    role: 'vendor' | 'supplier';
    location: string;
  }): Promise<boolean> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (userData.phone.length === 10 && userData.password.length >= 6 && userData.name.trim()) {
      const newUser: User = {
        id: `${userData.role}_${userData.phone}`,
        name: userData.name,
        phone: userData.phone,
        role: userData.role,
        location: userData.location
      };
      
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('sevakart_user', JSON.stringify(newUser));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('sevakart_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};