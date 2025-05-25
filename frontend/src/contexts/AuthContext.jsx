import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import axios from '../api/api';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initiale Authentifizierung prüfen
  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        try {
          const response = await axios.get(process.env.REACT_APP_API_URL + '/auth/me');
          setUser(response.data);
        } catch (error) {
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Logout Funktion
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  }, []);

  // Optional: vor dem Tab-Schließen kann man z. B. die Zeit merken
  useEffect(() => {
    const handleBeforeUnload = () => {
      // Hier KEIN logout() mehr!
      sessionStorage.setItem('lastUnload', Date.now().toString());
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  // Login Funktion
  const login = async (email, password) => {
    try {
      const response = await axios.post(process.env.REACT_APP_API_URL + '/auth/login', { email, password });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return user;
    } catch (error) {
      throw error.response?.data || { message: 'Ein Fehler ist aufgetreten' };
    }
  };

  // Registrierung
  const register = async (userData) => {
    try {
      const response = await axios.post(process.env.REACT_APP_API_URL + '/auth/register', {
        ...userData,
        dailyQuizReminder: Boolean(userData.dailyQuizReminder),
      });
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      setUser(user);
      return user;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Ein Fehler ist aufgetreten';
      throw new Error(errorMessage);
    }
  };

  // Passwort vergessen
  const forgotPassword = async (email) => {
    try {
      await axios.post(process.env.REACT_APP_API_URL + '/users/reset-password-request', { email });
    } catch (error) {
      throw error.response?.data || { message: 'Ein Fehler ist aufgetreten' };
    }
  };

  // Passwort zurücksetzen
  const resetPassword = async (token, password) => {
    try {
      await axios.post(process.env.REACT_APP_API_URL + `/users/reset-password/${token}`, { newPassword: password });
    } catch (error) {
      throw error.response?.data || { message: 'Ein Fehler ist aufgetreten' };
    }
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
  };

  if (loading) {
    return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;