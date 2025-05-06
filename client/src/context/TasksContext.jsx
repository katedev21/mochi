// src/context/TasksContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { fetchTasks, createTask, updateTask, deleteTask } from '../api/tasks';
import { useGoals } from './GoalsContext';

// Initial state
const initialState = {
  tasks: [],
  loading: false,
  error: null
};

// Action types
const ACTIONS = {
  FETCH_TASKS_REQUEST: 'FETCH_TASKS_REQUEST',
  FETCH_TASKS_SUCCESS: 'FETCH_TASKS_SUCCESS',
  FETCH_TASKS_FAILURE: 'FETCH_TASKS_FAILURE',
  
  CREATE_TASK_REQUEST: 'CREATE_TASK_REQUEST',
  CREATE_TASK_SUCCESS: 'CREATE_TASK_SUCCESS',
  CREATE_TASK_FAILURE: 'CREATE_TASK_FAILURE',
  
  UPDATE_TASK_REQUEST: 'UPDATE_TASK_REQUEST',
  UPDATE_TASK_SUCCESS: 'UPDATE_TASK_SUCCESS',
  UPDATE_TASK_FAILURE: 'UPDATE_TASK_FAILURE',
  
  DELETE_TASK_REQUEST: 'DELETE_TASK_REQUEST',
  DELETE_TASK_SUCCESS: 'DELETE_TASK_SUCCESS',
  DELETE_TASK_FAILURE: 'DELETE_TASK_FAILURE',
  
  GENERATE_TASKS_FROM_GOAL: 'GENERATE_TASKS_FROM_GOAL'
};

// Reducer function
const tasksReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.FETCH_TASKS_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case ACTIONS.FETCH_TASKS_SUCCESS:
      return {
        ...state,
        tasks: action.payload,
        loading: false
      };
    
    case ACTIONS.FETCH_TASKS_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case ACTIONS.CREATE_TASK_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case ACTIONS.CREATE_TASK_SUCCESS:
      return {
        ...state,
        tasks: [...state.tasks, action.payload],
        loading: false
      };
    
    case ACTIONS.CREATE_TASK_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case ACTIONS.UPDATE_TASK_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case ACTIONS.UPDATE_TASK_SUCCESS:
      return {
        ...state,
        tasks: state.tasks.map(task => 
          task.id === action.payload.id ? action.payload : task
        ),
        loading: false
      };
    
    case ACTIONS.UPDATE_TASK_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case ACTIONS.DELETE_TASK_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };
    
    case ACTIONS.DELETE_TASK_SUCCESS:
      return {
        ...state,
        tasks: state.tasks.filter(task => task.id !== action.payload),
        loading: false
      };
    
    case ACTIONS.DELETE_TASK_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    
    case ACTIONS.GENERATE_TASKS_FROM_GOAL:
      return {
        ...state,
        tasks: [...state.tasks, ...action.payload]
      };
    
    default:
      return state;
  }
};

// Create context
const TasksContext = createContext();

// Context provider component
export const TasksProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tasksReducer, initialState);
  const { updateShortTermGoal } = useGoals();
  
  // Load tasks on component mount
  useEffect(() => {
    const loadTasks = async () => {
      dispatch({ type: ACTIONS.FETCH_TASKS_REQUEST });
      
      try {
        const tasks = await fetchTasks();
        dispatch({ 
          type: ACTIONS.FETCH_TASKS_SUCCESS, 
          payload: tasks 
        });
      } catch (error) {
        dispatch({ 
          type: ACTIONS.FETCH_TASKS_FAILURE, 
          payload: error.message 
        });
      }
    };
    
    loadTasks();
  }, []);
  
  // Action creators
  const addTask = async (task) => {
    dispatch({ type: ACTIONS.CREATE_TASK_REQUEST });
    
    try {
      const newTask = await createTask(task);
      dispatch({ 
        type: ACTIONS.CREATE_TASK_SUCCESS, 
        payload: newTask 
      });
      
      return newTask;
    } catch (error) {
      dispatch({ 
        type: ACTIONS.CREATE_TASK_FAILURE, 
        payload: error.message 
      });
      throw error;
    }
  };
  
  const updateTaskItem = async (taskId, updates) => {
    dispatch({ type: ACTIONS.UPDATE_TASK_REQUEST });
    
    try {
      const updatedTask = await updateTask(taskId, updates);
      dispatch({ 
        type: ACTIONS.UPDATE_TASK_SUCCESS, 
        payload: updatedTask 
      });
      
      // If the task is completed and it's related to a goal, update the goal progress
      if (updates.completed && updatedTask.relatedGoalId) {
        await updateRelatedGoalProgress(updatedTask.relatedGoalId);
      }
      
      return updatedTask;
    } catch (error) {
      dispatch({ 
        type: ACTIONS.UPDATE_TASK_FAILURE, 
        payload: error.message 
      });
      throw error;
    }
  };
  
  const removeTask = async (taskId) => {
    dispatch({ type: ACTIONS.DELETE_TASK_REQUEST });
    
    try {
      await deleteTask(taskId);
      dispatch({ 
        type: ACTIONS.DELETE_TASK_SUCCESS, 
        payload: taskId 
      });
    } catch (error) {
      dispatch({ 
        type: ACTIONS.DELETE_TASK_FAILURE, 
        payload: error.message 
      });
      throw error;
    }
  };
  
  // Update the progress of a related goal when tasks are completed
  const updateRelatedGoalProgress = async (goalId) => {
    // Get all tasks related to this goal
    const relatedTasks = state.tasks.filter(task => task.relatedGoalId === goalId);
    
    if (relatedTasks.length > 0) {
      // Calculate progress based on completed tasks
      const completedTasks = relatedTasks.filter(task => task.completed).length;
      const progress = Math.round((completedTasks / relatedTasks.length) * 100);
      
      // Update the related short-term goal
      await updateShortTermGoal(goalId, { progress });
    }
  };
  
  // Generate tasks from a goal
  const generateTasksFromGoal = async (goalId) => {
    // This would typically connect to an AI service to generate relevant tasks
    // For now, we'll use a simple algorithm
    
    const suggestedTasks = [
      {
        title: `Research for Goal ${goalId}`,
        completed: false,
        estimatedTime: 30,
        relatedGoalId: goalId
      },
      {
        title: `Plan implementation for Goal ${goalId}`,
        completed: false,
        estimatedTime: 60,
        relatedGoalId: goalId
      },
      {
        title: `First action item for Goal ${goalId}`,
        completed: false,
        estimatedTime: 45,
        relatedGoalId: goalId
      }
    ];
    
    // Create all suggested tasks in the backend
    const createdTasks = await Promise.all(
      suggestedTasks.map(task => createTask(task))
    );
    
    // Update state
    dispatch({
      type: ACTIONS.GENERATE_TASKS_FROM_GOAL,
      payload: createdTasks
    });
    
    return createdTasks;
  };
  
  // Get daily tasks (for today)
  const getDailyTasks = () => {
    return state.tasks.filter(task => {
      // In a real app, we would have a more sophisticated way to determine daily tasks
      // This is a simplified approach
      return task.daily || (task.dueDate && isSameDay(new Date(task.dueDate), new Date()));
    });
  };
  
  // Helper function to check if two dates are the same day
  const isSameDay = (date1, date2) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    );
  };
  
  // Value to be provided to consumers
  const value = {
    tasks: state.tasks,
    dailyTasks: getDailyTasks(),
    loading: state.loading,
    error: state.error,
    addTask,
    updateTask: updateTaskItem,
    removeTask,
    generateTasksFromGoal
  };
  
  return (
    <TasksContext.Provider value={value}>
      {children}
    </TasksContext.Provider>
  );
};

// Custom hook to use the tasks context
export const useTasks = () => {
  const context = useContext(TasksContext);
  
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  
  return context;
};

export default TasksContext;