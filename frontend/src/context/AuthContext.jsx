import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, volunteerService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const data = await authService.login(email, password);
    setUser(data.user);
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    setUser(data.user);
    return data;
  };

  const registerVolunteer = async (volunteerData) => {
    const data = await volunteerService.register(volunteerData);
    setUser(data.user);
    return data;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const setAuthUser = (updatedUser) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem('ri_user', JSON.stringify(updatedUser));
    }
  };

  const isAdmin = Boolean(user && (user.is_staff || user.is_admin_or_staff));

  return (
    <AuthContext.Provider value={{ user, loading, login, register, registerVolunteer, logout, setAuthUser, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

