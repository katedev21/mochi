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
    return null;
  }
};

/**
 * Check if the user is authenticated
 * @returns {boolean} True if the user is authenticated
 */
export const isAuthenticated = () => {
  return !!getToken();
};

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>} Registration result
 */
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    const { token, user } = response;
    
    saveAuthData(token, user);
    return { success: true, user };
  } catch (error) {
    console.error('Registration error:', error);
    return { success: false, error: error.message };
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
    const { token, user } = response;
    
    saveAuthData(token, user);
    return { success: true, user };
  } catch (error) {
    console.error('Login error:', error);
    return { success: false, error: error.message };
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
    const { user } = response;
    
    // Update stored user data
    const currentUser = getCurrentUser();
    if (currentUser) {
      saveAuthData(getToken(), { ...currentUser, ...user });
    }
    
    return { success: true, user };
  } catch (error) {
    console.error('Profile update error:', error);
    return { success: false, error: error.message };
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
    return { success: false, error: error.message };
  }
};