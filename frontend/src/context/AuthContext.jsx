import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';

import { authService } from '../services/api';


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

    const data = await authService.login(
      identifier,
      password
    );

    // Login now sends an OTP.
    // JWT is NOT received until OTP verification.

    return data;
  };


  // ----------------------------------------------------------
  // LOGIN OTP - STEP 2
  // ----------------------------------------------------------

  const verifyLoginOTP = async (
    identifier,
    code
  ) => {

    const data =
      await authService.verifyLoginOTP(
        identifier,
        code
      );

    // Successful OTP verification
    // returns user + JWT tokens.

    if (data.user) {
      setUser(data.user);
    }

    return data;
  };


  // ----------------------------------------------------------
  // REGISTER
  // ----------------------------------------------------------

  const register = async (userData) => {

    const data =
      await authService.register(
        userData
      );

    // Registration does not log the user in.
    // The backend sends an OTP first.

    return data;
  };


  // ----------------------------------------------------------
  // VERIFY REGISTRATION OTP
  // ----------------------------------------------------------

  const verifyOTP = async (
    identifier,
    code
  ) => {

    const data =
      await authService.verifyOTP(
        identifier,
        code
      );

    // OTP verification returns
    // the user + JWT tokens.

    if (data.user) {
      setUser(data.user);
    }

    return data;
  };


  // ----------------------------------------------------------
  // RESEND REGISTRATION OTP
  // ----------------------------------------------------------

  const resendOTP = async (
    identifier
  ) => {

    const data =
      await authService.resendOTP(
        identifier
      );

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
  // ADMIN CHECK
  // ----------------------------------------------------------

  const isAdmin = Boolean(
    user &&
    (
      user.is_staff ||
      user.is_admin_or_staff
    )
  );


  // ----------------------------------------------------------
  // CONTEXT
  // ----------------------------------------------------------

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,

        login,

        verifyLoginOTP,

        register,

        verifyOTP,

        resendOTP,

        logout,

        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


// ------------------------------------------------------------
// useAuth Hook
// ------------------------------------------------------------

export const useAuth = () =>
  useContext(AuthContext);