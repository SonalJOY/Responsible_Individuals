import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, volunteerService } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------------
  // Load saved user when application starts
  // ----------------------------------------------------------
  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser(savedUser);
    }
    setLoading(false);
  }, []);

  // ----------------------------------------------------------
  // LOGIN - STEP 1
  // ----------------------------------------------------------
  const login = async (identifier, password) => {
    const data = await authService.login(identifier, password);
    // If direct login returned user (e.g. demo mode or fallback)
    if (data?.user) {
      setUser(data.user);
    }
    return data;
  };

  // ----------------------------------------------------------
  // LOGIN OTP - STEP 2
  // ----------------------------------------------------------
  const verifyLoginOTP = async (identifier, code) => {
    const data = await authService.verifyLoginOTP(identifier, code);
    if (data?.user) {
      setUser(data.user);
    }
    return data;
  };

  // ----------------------------------------------------------
  // REGISTER
  // ----------------------------------------------------------
  const register = async (userData) => {
    const data = await authService.register(userData);
    return data;
  };

  // ----------------------------------------------------------
  // REGISTER VOLUNTEER
  // ----------------------------------------------------------
  const registerVolunteer = async (volunteerData) => {
    const data = await volunteerService.register(volunteerData);
    if (data?.user) {
      setUser(data.user);
    }
    return data;
  };

  // ----------------------------------------------------------
  // VERIFY REGISTRATION OTP
  // ----------------------------------------------------------
  const verifyOTP = async (identifier, code) => {
    const data = await authService.verifyOTP(identifier, code);
    if (data?.user) {
      setUser(data.user);
    }
    return data;
  };

  // ----------------------------------------------------------
  // RESEND REGISTRATION OTP
  // ----------------------------------------------------------
  const resendOTP = async (identifier) => {
    const data = await authService.resendOTP(identifier);
    return data;
  };

  // ----------------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------------
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // ----------------------------------------------------------
  // SET AUTH USER (FOR LOCAL UPDATES)
  // ----------------------------------------------------------
  const setAuthUser = (updatedUser) => {
    setUser(updatedUser);
    if (updatedUser) {
      localStorage.setItem('ri_user', JSON.stringify(updatedUser));
    }
  };

  // ----------------------------------------------------------
  // ADMIN CHECK
  // ----------------------------------------------------------
  const isAdmin = Boolean(
    user && (user.is_staff || user.is_admin_or_staff)
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        verifyLoginOTP,
        register,
        registerVolunteer,
        verifyOTP,
        resendOTP,
        logout,
        setAuthUser,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
