// src/context/GoalsContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { fetchGoals, createGoal, updateGoal, deleteGoal } from '../api/goals';

// Initial state
const initialState = {
  longTermGoals: [],
  shortTermGoals: [],
  loading: false,
  error: null
};

// Action types
const ACTIONS = {
  FETCH_GOALS_REQUEST: 'FETCH_GOALS_REQUEST',
  FETCH_GOALS_SUCCESS: 'FETCH_GOALS_SUCCESS',
  FETCH_GOALS_FAILURE: 'FETCH_GOALS_FAILURE',
  
  CREATE_GOAL_REQUEST: 'CREATE_GOAL_REQUEST',
  CREATE_GOAL_SUCCESS: 'CREATE_GOAL_SUCCESS',
  CREATE_GOAL_FAILURE: 'CREATE_GOAL_FAILURE',
  
  UPDATE_GOAL_REQUEST: 'UPDATE_GOAL_REQUEST',
  UPDATE_GOAL_SUCCESS: 'UPDATE_GOAL_SUCCESS',
  UPDATE_GOAL_FAILURE: 'UPDATE_GOAL_FAILURE',
  
  DELETE_GOAL_REQUEST: 'DELETE_GOAL_REQUEST',
  DELETE_GOAL_SUCCESS: 'DELETE_GOAL_SUCCESS',
  DELETE_GOAL_FAILURE: 'DELETE_GOAL_FAILURE',
  
  GENERATE_SHORT_TERM_GOALS: 'GENERATE_SHORT_TERM_GOALS'
};

// Reducer function
const goalsReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.FETCH_GOALS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case ACTIONS.FETCH_GOALS_SUCCESS:
      return {
        ...state,
        longTermGoals: action.payload.longTermGoals,
        shortTermGoals: action.payload.shortTermGoals,
        loading: false
      };
    
    case ACTIONS.FETCH_GOALS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case ACTIONS.CREATE_GOAL_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case ACTIONS.CREATE_GOAL_SUCCESS:
      if (action.payload.type === 'long-term') {
        return {
          ...state,
          longTermGoals: [...state.longTermGoals, action.payload.goal],
          loading: false
        };
      } else {
        return {
          ...state,
          shortTermGoals: [...state.shortTermGoals, action.payload.goal],
          loading: false
        };
      }
    
    case ACTIONS.CREATE_GOAL_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case ACTIONS.UPDATE_GOAL_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case ACTIONS.UPDATE_GOAL_SUCCESS:
      if (action.payload.type === 'long-term') {
        return {
          ...state,
          longTermGoals: state.longTermGoals.map(goal => 
            goal.id === action.payload.goal.id ? action.payload.goal : goal
          ),
          loading: false
        };
      } else {
        return {
          ...state,
          shortTermGoals: state.shortTermGoals.map(goal => 
            goal.id === action.payload.goal.id ? action.payload.goal : goal
          ),
          loading: false
        };
      }
    
    case ACTIONS.UPDATE_GOAL_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case ACTIONS.DELETE_GOAL_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case ACTIONS.DELETE_GOAL_SUCCESS:
      if (action.payload.type === 'long-term') {
        return {
          ...state,
          longTermGoals: state.longTermGoals.filter(goal => goal.id !== action.payload.id),
          // Also delete any short-term goals associated with this long-term goal
          shortTermGoals: state.shortTermGoals.filter(goal => goal.parentGoalId !== action.payload.id),
          loading: false
        };
      } else {
        return {
          ...state,
          shortTermGoals: state.shortTermGoals.filter(goal => goal.id !== action.payload.id),
          loading: false
        };
      }
    
    case ACTIONS.DELETE_GOAL_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case ACTIONS.GENERATE_SHORT_TERM_GOALS:
      const { longTermGoalId, shortTermGoals } = action.payload;
      return {
        ...state,
        shortTermGoals: [...state.shortTermGoals, ...shortTermGoals]
      };
    
    default:
      return state;
  }
};

// Create context
const GoalsContext = createContext();

// Context provider component
export const GoalsProvider = ({ children }) => {
  const [state, dispatch] = useReducer(goalsReducer, initialState);
  
  // Load goals on component mount
  useEffect(() => {
    const loadGoals = async () => {
      dispatch({ type: ACTIONS.FETCH_GOALS_REQUEST });
      
      try {
        const { longTermGoals, shortTermGoals } = await fetchGoals();
        dispatch({ 
          type: ACTIONS.FETCH_GOALS_SUCCESS, 
          payload: { longTermGoals, shortTermGoals } 
        });
      } catch (error) {
        dispatch({ 
          type: ACTIONS.FETCH_GOALS_FAILURE, 
          payload: error.message 
        });
      }
    };
    
    loadGoals();
  }, []);
  
  // Action creators
  const addLongTermGoal = async (goal) => {
    dispatch({ type: ACTIONS.CREATE_GOAL_REQUEST });
    
    try {
      const newGoal = await createGoal(goal, 'long-term');
      dispatch({ 
        type: ACTIONS.CREATE_GOAL_SUCCESS, 
        payload: { type: 'long-term', goal: newGoal } 
      });
      
      return newGoal;
    } catch (error) {
      dispatch({ 
        type: ACTIONS.CREATE_GOAL_FAILURE, 
        payload: error.message 
      });
      throw error;
    }
  };
  
  const addShortTermGoal = async (goal) => {
    dispatch({ type: ACTIONS.CREATE_GOAL_REQUEST });
    
    try {
      const newGoal = await createGoal(goal, 'short-term');
      dispatch({ 
        type: ACTIONS.CREATE_GOAL_SUCCESS, 
        payload: { type: 'short-term', goal: newGoal } 
      });
      
      return newGoal;
    } catch (error) {
      dispatch({ 
        type: ACTIONS.CREATE_GOAL_FAILURE, 
        payload: error.message 
      });
      throw error;
    }
  };
  
  const updateLongTermGoal = async (goalId, updates) => {
    dispatch({ type: ACTIONS.UPDATE_GOAL_REQUEST });
    
    try {
      const updatedGoal = await updateGoal(goalId, updates, 'long-term');
      dispatch({ 
        type: ACTIONS.UPDATE_GOAL_SUCCESS, 
        payload: { type: 'long-term', goal: updatedGoal } 
      });
      
      return updatedGoal;
    } catch (error) {
      dispatch({ 
        type: ACTIONS.UPDATE_GOAL_FAILURE, 
        payload: error.message 
      });
      throw error;
    }
  };
  
  const updateShortTermGoal = async (goalId, updates) => {
    dispatch({ type: ACTIONS.UPDATE_GOAL_REQUEST });
    
    try {
      const updatedGoal = await updateGoal(goalId, updates, 'short-term');
      dispatch({ 
        type: ACTIONS.UPDATE_GOAL_SUCCESS, 
        payload: { type: 'short-term', goal: updatedGoal } 
      });
      
      return updatedGoal;
    } catch (error) {
      dispatch({ 
        type: ACTIONS.UPDATE_GOAL_FAILURE, 
        payload: error.message 
      });
      throw error;
    }
  };
  
  const deleteLongTermGoal = async (goalId) => {
    dispatch({ type: ACTIONS.DELETE_GOAL_REQUEST });
    
    try {
      await deleteGoal(goalId, 'long-term');
      dispatch({ 
        type: ACTIONS.DELETE_GOAL_SUCCESS, 
        payload: { type: 'long-term', id: goalId } 
      });
    } catch (error) {
      dispatch({ 
        type: ACTIONS.DELETE_GOAL_FAILURE, 
        payload: error.message 
      });
      throw error;
    }
  };
  
  const deleteShortTermGoal = async (goalId) => {
    dispatch({ type: ACTIONS.DELETE_GOAL_REQUEST });
    
    try {
      await deleteGoal(goalId, 'short-term');
      dispatch({ 
        type: ACTIONS.DELETE_GOAL_SUCCESS, 
        payload: { type: 'short-term', id: goalId } 
      });
    } catch (error) {
      dispatch({ 
        type: ACTIONS.DELETE_GOAL_FAILURE, 
        payload: error.message 
      });
      throw error;
    }
  };
  
  // Generate short-term goals based on a long-term goal
  const generateShortTermGoals = async (longTermGoalId) => {
    const longTermGoal = state.longTermGoals.find(goal => goal.id === longTermGoalId);
    
    if (!longTermGoal) {
      throw new Error('Long-term goal not found');
    }
    
    // Find the next upcoming milestone
    const upcomingMilestone = longTermGoal.milestones
      .filter(milestone => !milestone.completed)
      .sort((a, b) => new Date(a.targetDate) - new Date(b.targetDate))[0];
    
    if (!upcomingMilestone) {
      throw new Error('No upcoming milestones found');
    }
    
    // Generate suggested goals
    const today = new Date();
    const suggestedGoals = [
      // Monthly goal
      {
        parentGoalId: longTermGoalId,
        title: `Monthly Progress: ${upcomingMilestone.title}`,
        description: `Complete 25% of work needed for ${upcomingMilestone.title}`,
        timeframe: 'monthly',
        endDate: new Date(today.getFullYear(), today.getMonth() + 1, today.getDate()),
        progress: 0,
        completed: false
      },
      // Weekly goal
      {
        parentGoalId: longTermGoalId,
        title: `Weekly Progress: ${upcomingMilestone.title}`,
        description: `Make measurable progress toward ${upcomingMilestone.title}`,
        timeframe: 'weekly',
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 7),
        progress: 0,
        completed: false
      },
      // Daily goal
      {
        parentGoalId: longTermGoalId,
        title: `Daily Task: ${upcomingMilestone.title}`,
        description: `Take one action toward ${upcomingMilestone.title}`,
        timeframe: 'daily',
        endDate: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1),
        progress: 0,
        completed: false
      }
    ];
    
    // Create all suggested goals in the backend
    const createdGoals = await Promise.all(
      suggestedGoals.map(goal => createGoal(goal, 'short-term'))
    );
    
    // Update state
    dispatch({
      type: ACTIONS.GENERATE_SHORT_TERM_GOALS,
      payload: {
        longTermGoalId,
        shortTermGoals: createdGoals
      }
    });
    
    return createdGoals;
  };
  
  // Value to be provided to consumers
  const value = {
    longTermGoals: state.longTermGoals,
    shortTermGoals: state.shortTermGoals,
    loading: state.loading,
    error: state.error,
    addLongTermGoal,
    addShortTermGoal,
    updateLongTermGoal,
    updateShortTermGoal,
    deleteLongTermGoal,
    deleteShortTermGoal,
    generateShortTermGoals
  };
  
  return (
    <GoalsContext.Provider value={value}>
      {children}
    </GoalsContext.Provider>
  );
};

// Custom hook to use the goals context
export const useGoals = () => {
  const context = useContext(GoalsContext);
  
  if (context === undefined) {
    throw new Error('useGoals must be used within a GoalsProvider');
  }
  
  return context;
};

export default GoalsContext;