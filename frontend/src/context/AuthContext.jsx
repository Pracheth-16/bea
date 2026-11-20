import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext();

export const DEMO_USERS = [
  {
    role: 'employee',
    label: 'Employee / Student',
    name: 'Pavan R Bhat (1BY23IS145)',
    email: 'employee@bmsit.ac.in',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  },
  {
    role: 'agent',
    label: 'IT Support Agent',
    name: 'Pracheth Kashyap (Agent)',
    email: 'agent@bmsit.ac.in',
    badge: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  {
    role: 'supervisor',
    label: 'IT Supervisor',
    name: 'Puneethgouda Patil (Supervisor)',
    email: 'supervisor@bmsit.ac.in',
    badge: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  {
    role: 'admin',
    label: 'System Administrator',
    name: 'Mrs. Poornima GJ (Admin)',
    email: 'admin@bmsit.ac.in',
    badge: 'bg-amber-100 text-amber-800 border-amber-300'
  }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [unreadNotifs, setUnreadNotifs] = useState(0);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem('itsm_token');
      if (token) {
        api.setToken(token);
        const data = await api.getMe();
        setUser(data.user);
        refreshNotifications();
      } else {
        // Auto-login as Employee on first visit for effortless demo review
        await quickSwitchRole('employee');
      }
    } catch (err) {
      console.warn('Auto auth check failed:', err.message);
      // Fallback switch to demo role
      await quickSwitchRole('employee');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const data = await api.login(email, password);
    api.setToken(data.token);
    setUser(data.user);
    refreshNotifications();
    return data.user;
  };

  const quickSwitchRole = async (targetRole) => {
    const demo = DEMO_USERS.find((d) => d.role === targetRole) || DEMO_USERS[0];
    try {
      const data = await api.login(demo.email, 'password123');
      api.setToken(data.token);
      setUser(data.user);
      refreshNotifications();
    } catch (err) {
      console.error('Failed to quick-switch role:', err);
    }
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
  };

  const refreshNotifications = async () => {
    try {
      const res = await api.getNotifications();
      setUnreadNotifs(res.unreadCount || 0);
    } catch (e) {
      // ignore
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        unreadNotifs,
        login,
        logout,
        quickSwitchRole,
        refreshNotifications
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

