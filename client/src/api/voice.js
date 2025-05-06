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