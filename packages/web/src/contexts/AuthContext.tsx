import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setAuthToken } from '../services/api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  organizationId: string;
}

interface Organization {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  organization: Organization | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        setAuthToken(storedToken);
        try {
          const response = await api.get('/auth/me');
          setUser(response.data);
          setOrganization(response.data.organization);
        } catch (error) {
          console.error('Failed to load user:', error);
          localStorage.removeItem('token');
          setAuthToken(null);
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const { token, user, organization } = response.data;

    localStorage.setItem('token', token);
    setAuthToken(token);
    setToken(token);
    setUser(user);
    setOrganization(organization);
  };

  const register = async (data: any) => {
    const response = await api.post('/auth/register', data);
    const { token, user, organization } = response.data;

    localStorage.setItem('token', token);
    setAuthToken(token);
    setToken(token);
    setUser(user);
    setOrganization(organization);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setAuthToken(null);
    setToken(null);
    setUser(null);
    setOrganization(null);
  };

  return (
    <AuthContext.Provider value={{ user, organization, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

