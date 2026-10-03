import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [role, setRole] = useState(localStorage.getItem('role') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      if (token && role) {
        try {
          if (role === 'admin' || role === 'superadmin') {
            // Admin authentication
            // For simplicity, we keep the admin details in state or fetch dashboard stats.
            // Let's create a placeholder admin object from stored data
            const storedAdmin = localStorage.getItem('userData');
            if (storedAdmin) {
              setUser(JSON.parse(storedAdmin));
            }
          } else {
            // Voter profile fetch
            const res = await api.get('/auth/profile');
            if (res.data.success) {
              setUser(res.data.data);
            }
          }
        } catch (error) {
          console.error('Failed to load session:', error);
          logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, [token, role]);

  const login = async (email, password) => {
  setLoading(true);

  try {
    const res = await api.post('/auth/login', { email, password });

    if (res.data.success) {
      const { token: userToken, data } = res.data;

      // Clear any previous session
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userData');

      // Store NEW voter session
      localStorage.setItem('token', userToken);
      localStorage.setItem('role', data.role);
      localStorage.setItem('userData', JSON.stringify(data));

      setToken(userToken);
      setRole(data.role);
      setUser(data);

      return { success: true };
    }

    return {
      success: false,
      message: res.data.message || 'Login failed.',
    };

  } catch (error) {
    return {
      success: false,
      message:
        error.response?.data?.message ||
        'Login failed. Please try again.',
    };
  } finally {
    setLoading(false);
  }
};

  const adminLogin = async (email, password) => {
    setLoading(true);
    try {
      const res = await api.post('/admin/login', { email, password });
      if (res.data.success) {
        const { token: adminToken, data } = res.data;
        localStorage.setItem('token', adminToken);
        localStorage.setItem('role', data.role);
        localStorage.setItem('userData', JSON.stringify(data));
        setToken(adminToken);
        setRole(data.role);
        setUser(data);
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Admin login failed.',
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (formData) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data;
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed.',
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userData');
    setToken(null);
    setRole(null);
    setUser(null);
  };

  const updateProfile = async (formData) => {
    try {
      const res = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      if (res.data.success) {
        setUser(res.data.data);
        localStorage.setItem('userData', JSON.stringify(res.data.data));
        return { success: true };
      }
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Update profile failed.',
      };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        role,
        loading,
        login,
        adminLogin,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
