// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  getToken, 
  getCurrentUser, 
  login as authLogin, 
  register as authRegister,
  logout as authLogout,
  updateProfile as authUpdateProfile
} from '../services/auth';

// Create the context
const AuthContext = createContext();

// Provider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check for existing auth on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        setLoading(true);
        const token = getToken();
        const currentUser = getCurrentUser();
        
        if (currentUser && token) {
          setUser(currentUser);
        }
      } catch (err) {
        console.error('Error initializing auth:', err);
        setError(err.message);
      } finally {
        // Always set loading to false when initialization completes
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);
  
  // Login handler
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authLogin(email, password);
      
      if (result.success) {
        setUser(result.user);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Register handler
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authRegister(userData);
      
      if (result.success) {
        setUser(result.user);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Logout handler
  const logout = () => {
    authLogout();
    setUser(null);
  };
  
  // Update profile handler
  const updateProfile = async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await authUpdateProfile(userData);
      
      if (result.success) {
        setUser(result.user);
        return { success: true };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Context value
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    login,
    register,
    logout,
    updateProfile
  };
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
};

export default AuthContext;