import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchUserData = async (token) => {
    try {
      const response = await axios.get('http://localhost:8000/api/auth/profile/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Ошибка получения данных пользователя:', error);
      return null;
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decoded = jwtDecode(token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          
          const userData = await fetchUserData(token);
          setUser(userData);
        } catch (error) {
          console.error('Ошибка декодирования токена:', error);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const register = async (username, password1, password2) => {
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/api/auth/register/', {
        username,
        password: password1,
        password2
      });
      
      if (response.data) {
        await login(username, password1);
        return true;
      }
    } catch (error) {
      setError(error.response?.data || 'Ошибка регистрации');
      throw error;
    }
  };

  const login = async (username, password) => {
    setError(null);
    try {
      const response = await axios.post('http://localhost:8000/api/auth/login/', {
        username,
        password
      });
      
      const { access, refresh } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      const userData = await fetchUserData(access);
      setUser(userData);
      return true;
    } catch (error) {
      setError(error.response?.data?.detail || 'Неверный логин или пароль');
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};