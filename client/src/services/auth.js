// src/services/auth.js
import api from '../api';

// Local storage keys
const TOKEN_KEY = 'productivity_assistant_token';
const USER_KEY = 'productivity_assistant_user';

/**
 * Save authentication data to local storage
 * @param {string} token - JWT token
 * @param {Object} user - User data
 */
const saveAuthData = (token, user) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

/**
 * Clear authentication data from local storage
 */
const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

/**
 * Get the authentication token from local storage
 * @returns {string|null} Auth token or null if not found
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get the current user data from local storage
 * @returns {Object|null} User data or null if not logged in
 */
export const getCurrentUser = () => {
  const userJson = localStorage.getItem(USER_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson);
  } catch (error) {
    console.error('Error parsing user data:', error);
    clearAuthData(); // Clear invalid data
    return null;
  }
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if the user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken() && !!getCurrentUser();
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registration result
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    
    if (response && response.token && response.user) {
      saveAuthData(response.token, response.user);
      return { success: true, user: response.user };
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Registration error:', error);
    return { 
      success: false, 
      error: error.message || 'Registration failed. Please try again.' 
    };
  }
};

/**
 * Login a user
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<Object>} Login result
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    
    if (response && response.token && response.user) {
      saveAuthData(response.token, response.user);
      return { success: true, user: response.user };
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Login error:', error);
    return { 
      success: false, 
      error: error.message || 'Login failed. Please check your credentials and try again.' 
    };
  }
};

/**
 * Logout the current user
 */
export const logout = () => {
  clearAuthData();
};

/**
 * Update user profile
 * @param {Object} userData - User data to update
 * @returns {Promise<Object>} Updated user
 */
export const updateProfile = async (userData) => {
  try {
    const response = await api.put('/auth/profile', userData);
    
    if (response && response.user) {
      // Update stored user data
      const currentUser = getCurrentUser();
      if (currentUser) {
        saveAuthData(getToken(), { ...currentUser, ...response.user });
      }
      
      return { success: true, user: response.user };
    } else {
      throw new Error('Invalid response from server');
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return { 
      success: false, 
      error: error.message || 'Profile update failed. Please try again.' 
    };
  }
};

/**
 * Change user password
 * @param {string} currentPassword - Current password
 * @param {string} newPassword - New password
 * @returns {Promise<Object>} Password change result
 */
export const changePassword = async (currentPassword, newPassword) => {
  try {
    await api.post('/auth/change-password', {
      currentPassword,
      newPassword
    });
    
    return { success: true };
  } catch (error) {
    console.error('Password change error:', error);
    return { 
      success: false, 
      error: error.message || 'Password change failed. Please check your current password and try again.' 
    };
  }
};