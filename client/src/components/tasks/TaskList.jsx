// src/components/tasks/TaskList.jsx
import React, { useState } from 'react';
import { Check, Edit, Trash2, Clock, AlertCircle } from 'lucide-react';
import { useTasks } from '../../context/TasksContext';

const TaskList = ({ tasks = [] }) => {
  const { updateTask, removeTask } = useTasks();
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTaskTitle, setEditTaskTitle] = useState('');

  // Handle task completion toggle
  const handleToggleComplete = async (task) => {
    try {
      await updateTask(task.id, { completed: !task.completed });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Start editing a task
  const handleStartEdit = (task) => {
    setEditingTaskId(task.id);
    setEditTaskTitle(task.title);
  };

  // Save edited task
  const handleSaveEdit = async (taskId) => {
    if (editTaskTitle.trim()) {
      try {
        await updateTask(taskId, { title: editTaskTitle });
        setEditingTaskId(null);
      } catch (error) {
        console.error('Error updating task:', error);
      }
    }
  };

  // Delete a task
  const handleDelete = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await removeTask(taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  // Calculate priority styling
  const getPriorityStyle = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-orange-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  // Sort tasks by priority and completion status
  const sortedTasks = [...tasks].sort((a, b) => {
    // First sort by completion status
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then sort by priority
    const priorityValues = { high: 3, medium: 2, low: 1 };
    const aPriority = priorityValues[a.priority] || 0;
    const bPriority = priorityValues[b.priority] || 0;
    return bPriority - aPriority;
  });

  if (sortedTasks.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No tasks to display.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {sortedTasks.map((task) => (
        <div 
          key={task.id} 
          className={`p-3 rounded-lg border ${
            task.completed 
              ? 'bg-gray-50 border-gray-200' 
              : 'bg-white border-gray-200'
          } transition-all duration-300`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center flex-grow">
              <button
                onClick={() => handleToggleComplete(task)}
                className={`mr-3 flex-shrink-0 p-1 rounded-full ${
                  task.completed 
                    ? 'text-green-500 bg-green-50' 
                    : 'text-gray-400 bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <Check className="h-5 w-5" />
              </button>
              
              {editingTaskId === task.id ? (
                <input
                  type="text"
                  value={editTaskTitle}
                  onChange={(e) => setEditTaskTitle(e.target.value)}
                  onBlur={() => handleSaveEdit(task.id)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveEdit(task.id)}
                  className="flex-grow p-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
              ) : (
                <div className="flex-grow">
                  <p className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                    {task.title}
                  </p>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center ml-4 space-x-2">
              {task.estimatedTime && (
                <span className="flex items-center text-sm text-gray-500">
                  <Clock className="h-4 w-4 mr-1" /> 
                  {task.estimatedTime} min
                </span>
              )}
              
              {task.priority && (
                <span className={`flex items-center text-sm ${getPriorityStyle(task.priority)}`}>
                  <AlertCircle className="h-4 w-4 mr-1" /> 
                  {task.priority}
                </span>
              )}
              
              {!task.completed && (
                <button
                  onClick={() => handleStartEdit(task)}
                  className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
              )}
              
              <button
                onClick={() => handleDelete(task.id)}
                className="p-1 text-red-500 hover:text-red-700 transition-colors"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          {task.dueDate && (
            <div className="mt-2 text-sm text-gray-500">
              Due: {new Date(task.dueDate).toLocaleDateString()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TaskList;