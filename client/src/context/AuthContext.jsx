import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Validate session on app load
  useEffect(() => {
    const checkToken = async () => {
      const token = localStorage.getItem('luna_token');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/profile');
        const normalizedUser = {
          ...data,
          role: data.role === 'parent' ? 'student' : data.role,
          token
        };
        setUser(normalizedUser);
      } catch (error) {
        console.error('Session verification failed:', error);
        localStorage.removeItem('luna_token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkToken();
  }, []);

  // Login handler
  const login = async (email, password, role) => {
    try {
      const { data } = await api.post('/auth/login', { email, password, role });
      const normalizedUser = {
        ...data,
        role: data.role === 'parent' ? 'student' : data.role
      };
      setUser(normalizedUser);
      localStorage.setItem('luna_token', data.token);
      return { success: true, user: normalizedUser };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed. Please check credentials.',
      };
    }
  };

  // Logout handler
  const logout = () => {
    setUser(null);
    localStorage.removeItem('luna_token');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
