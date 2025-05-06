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