// src/api/index.js
import axios from 'axios';
import { getToken } from '../services/auth';

// Create an Axios instance with common configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'https://api.productivityassistant.com/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add authorization token to requests
api.interceptors.request.use(
  (config) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const errorMsg = error.response?.data?.message || error.message || 'Unknown error occurred';
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Redirect to login or refresh token
      window.location.href = '/login';
    }
    
    console.error('API Error:', errorMsg);
    return Promise.reject(new Error(errorMsg));
  }
);

export default api;

// src/api/goals.js
import api from './index';

/**
 * Fetch all goals for the authenticated user
 * @returns {Promise<{longTermGoals: Array, shortTermGoals: Array}>} Goals data
 */
export const fetchGoals = async () => {
  try {
    const response = await api.get('/goals');
    return {
      longTermGoals: response.longTermGoals || [],
      shortTermGoals: response.shortTermGoals || []
    };
  } catch (error) {
    console.error('Error fetching goals:', error);
    throw error;
  }
};

/**
 * Create a new goal
 * @param {Object} goalData - Goal data to create
 * @param {string} type - Goal type ('long-term' or 'short-term')
 * @returns {Promise<Object>} Created goal
 */
export const createGoal = async (goalData, type) => {
  try {
    const response = await api.post(`/goals/${type}`, goalData);
    return response.goal;
  } catch (error) {
    console.error('Error creating goal:', error);
    throw error;
  }
};

/**
 * Update an existing goal
 * @param {string|number} goalId - Goal ID to update
 * @param {Object} updates - Goal data to update
 * @param {string} type - Goal type ('long-term' or 'short-term')
 * @returns {Promise<Object>} Updated goal
 */
export const updateGoal = async (goalId, updates, type) => {
  try {
    const response = await api.put(`/goals/${type}/${goalId}`, updates);
    return response.goal;
  } catch (error) {
    console.error('Error updating goal:', error);
    throw error;
  }
};

/**
 * Delete a goal
 * @param {string|number} goalId - Goal ID to delete
 * @param {string} type - Goal type ('long-term' or 'short-term')
 * @returns {Promise<void>}
 */
export const deleteGoal = async (goalId, type) => {
  try {
    await api.delete(`/goals/${type}/${goalId}`);
  } catch (error) {
    console.error('Error deleting goal:', error);
    throw error;
  }
};

/**
 * Add a milestone to a long-term goal
 * @param {string|number} goalId - Goal ID to add milestone to
 * @param {Object} milestoneData - Milestone data to create
 * @returns {Promise<Object>} Updated goal with new milestone
 */
export const addMilestone = async (goalId, milestoneData) => {
  try {
    const response = await api.post(`/goals/long-term/${goalId}/milestones`, milestoneData);
    return response.goal;
  } catch (error) {
    console.error('Error adding milestone:', error);
    throw error;
  }
};

/**
 * Update a milestone
 * @param {string|number} goalId - Goal ID that contains the milestone
 * @param {string|number} milestoneId - Milestone ID to update
 * @param {Object} updates - Milestone data to update
 * @returns {Promise<Object>} Updated goal with updated milestone
 */
export const updateMilestone = async (goalId, milestoneId, updates) => {
  try {
    const response = await api.put(`/goals/long-term/${goalId}/milestones/${milestoneId}`, updates);
    return response.goal;
  } catch (error) {
    console.error('Error updating milestone:', error);
    throw error;
  }
};

/**
 * Delete a milestone
 * @param {string|number} goalId - Goal ID that contains the milestone
 * @param {string|number} milestoneId - Milestone ID to delete
 * @returns {Promise<Object>} Updated goal without the deleted milestone
 */
export const deleteMilestone = async (goalId, milestoneId) => {
  try {
    const response = await api.delete(`/goals/long-term/${goalId}/milestones/${milestoneId}`);
    return response.goal;
  } catch (error) {
    console.error('Error deleting milestone:', error);
    throw error;
  }
};

// src/api/tasks.js
import api from './index';

/**
 * Fetch all tasks for the authenticated user
 * @returns {Promise<Array>} Tasks data
 */
export const fetchTasks = async () => {
  try {
    const response = await api.get('/tasks');
    return response.tasks || [];
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

/**
 * Create a new task
 * @param {Object} taskData - Task data to create
 * @returns {Promise<Object>} Created task
 */
export const createTask = async (taskData) => {
  try {
    const response = await api.post('/tasks', taskData);
    return response.task;
  } catch (error) {
    console.error('Error creating task:', error);
    throw error;
  }
};

/**
 * Update an existing task
 * @param {string|number} taskId - Task ID to update
 * @param {Object} updates - Task data to update
 * @returns {Promise<Object>} Updated task
 */
export const updateTask = async (taskId, updates) => {
  try {
    const response = await api.put(`/tasks/${taskId}`, updates);
    return response.task;
  } catch (error) {
    console.error('Error updating task:', error);
    throw error;
  }
};

/**
 * Delete a task
 * @param {string|number} taskId - Task ID to delete
 * @returns {Promise<void>}
 */
export const deleteTask = async (taskId) => {
  try {
    await api.delete(`/tasks/${taskId}`);
  } catch (error) {
    console.error('Error deleting task:', error);
    throw error;
  }
};

/**
 * Batch update tasks
 * @param {Array<Object>} tasks - Array of tasks with updates
 * @returns {Promise<Array>} Updated tasks
 */
export const batchUpdateTasks = async (tasks) => {
  try {
    const response = await api.put('/tasks/batch', { tasks });
    return response.tasks;
  } catch (error) {
    console.error('Error batch updating tasks:', error);
    throw error;
  }
};

// src/api/voice.js
import api from './index';

/**
 * Process a voice command with the backend NLP service
 * @param {string} text - The voice command text to process
 * @returns {Promise<Object>} Processed command with intent and entities
 */
export const processVoiceCommand = async (text) => {
  try {
    const response = await api.post('/voice/process', { text });
    return response.result;
  } catch (error) {
    console.error('Error processing voice command:', error);
    throw error;
  }
};

/**
 * Get AI suggestions based on goals and tasks
 * @param {Object} context - Context data including goals and tasks
 * @returns {Promise<Object>} AI suggestions
 */
export const getAISuggestions = async (context) => {
  try {
    const response = await api.post('/ai/suggestions', context);
    return response.suggestions;
  } catch (error) {
    console.error('Error getting AI suggestions:', error);
    throw error;
  }
};

/**
 * Generate short-term goals based on long-term goals
 * @param {string|number} longTermGoalId - Long-term goal ID to generate from
 * @returns {Promise<Array>} Generated short-term goals
 */
export const generateShortTermGoals = async (longTermGoalId) => {
  try {
    const response = await api.post(`/ai/generate/short-term-goals`, { longTermGoalId });
    return response.goals;
  } catch (error) {
    console.error('Error generating short-term goals:', error);
    throw error;
  }
};

/**
 * Generate tasks based on a goal
 * @param {string|number} goalId - Goal ID to generate tasks for
 * @param {string} goalType - Goal type ('long-term' or 'short-term')
 * @returns {Promise<Array>} Generated tasks
 */
export const generateTasks = async (goalId, goalType) => {
  try {
    const response = await api.post(`/ai/generate/tasks`, { goalId, goalType });
    return response.tasks;
  } catch (error) {
    console.error('Error generating tasks:', error);
    throw error;
  }
};