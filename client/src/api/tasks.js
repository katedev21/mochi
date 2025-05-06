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