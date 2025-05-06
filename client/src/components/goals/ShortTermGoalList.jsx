// src/components/goals/ShortTermGoalList.jsx
import React, { useState } from 'react';
import { CheckCircle, Edit, Trash2, Calendar, BarChart4 } from 'lucide-react';
import { useGoals } from '../../context/GoalsContext';
import { useTasks } from '../../context/TasksContext';

const ShortTermGoalList = ({ goals = [] }) => {
  const { updateShortTermGoal, deleteShortTermGoal } = useGoals();
  const { generateTasksFromGoal } = useTasks();
  const [expandedGoalId, setExpandedGoalId] = useState(null);

  // Toggle goal expansion
  const toggleExpand = (goalId) => {
    setExpandedGoalId(expandedGoalId === goalId ? null : goalId);
  };

  // Toggle completion status
  const handleToggleComplete = async (goal) => {
    try {
      await updateShortTermGoal(goal.id, { 
        completed: !goal.completed,
        progress: !goal.completed ? 100 : goal.progress
      });
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  // Update progress
  const handleProgressUpdate = async (goal, newProgress) => {
    try {
      await updateShortTermGoal(goal.id, { 
        progress: newProgress,
        completed: newProgress === 100
      });
    } catch (error) {
      console.error('Error updating goal progress:', error);
    }
  };

  // Delete goal
  const handleDelete = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        await deleteShortTermGoal(goalId);
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  // Generate tasks from goal
  const handleGenerateTasks = async (goalId) => {
    try {
      await generateTasksFromGoal(goalId);
    } catch (error) {
      console.error('Error generating tasks:', error);
    }
  };

  // Get timeframe badge styling
  const getTimeframeStyle = (timeframe) => {
    switch (timeframe) {
      case 'daily':
        return 'bg-green-100 text-green-800';
      case 'weekly':
        return 'bg-blue-100 text-blue-800';
      case 'monthly':
        return 'bg-purple-100 text-purple-800';
      case 'quarterly':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (goals.length === 0) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p>No goals to display.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {goals.map((goal) => (
        <div 
          key={goal.id} 
          className={`border rounded-lg overflow-hidden ${
            goal.completed ? 'bg-gray-50 border-gray-200' : 'bg-white border-gray-200'
          }`}
        >
          <div className="p-4">
            <div className="flex justify-between items-start">
              <div className="flex items-start space-x-3">
                <button
                  onClick={() => handleToggleComplete(goal)}
                  className={`mt-1 flex-shrink-0 ${
                    goal.completed ? 'text-green-500' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <CheckCircle className="h-5 w-5" />
                </button>
                
                <div>
                  <h3 
                    className={`font-medium ${goal.completed ? 'text-gray-500' : 'text-gray-800'}`}
                    onClick={() => toggleExpand(goal.id)}
                  >
                    {goal.title}
                  </h3>
                  
                  <div className="flex items-center mt-1 space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${getTimeframeStyle(goal.timeframe)}`}>
                      {goal.timeframe}
                    </span>
                    
                    {goal.endDate && (
                      <span className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" /> 
                        {formatDate(goal.endDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleGenerateTasks(goal.id)}
                  className="p-1 text-purple-500 hover:text-purple-700 transition-colors"
                  title="Generate Tasks"
                >
                  <BarChart4 className="h-4 w-4" />
                </button>
                
                <button
                  onClick={() => handleDelete(goal.id)}
                  className="p-1 text-red-500 hover:text-red-700 transition-colors"
                  title="Delete Goal"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Progress: {goal.progress}%</span>
                <span className="text-xs text-gray-500">
                  {goal.completed ? 'Completed' : 'In Progress'}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {expandedGoalId === goal.id && (
            <div className="px-4 pb-4 pt-2 border-t border-gray-200">
              {goal.description && (
                <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
              )}
              
              <div className="flex flex-wrap gap-2">
                {[0, 25, 50, 75, 100].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleProgressUpdate(goal, value)}
                    className={`px-2 py-1 text-xs rounded ${
                      goal.progress === value
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    {value}%
                  </button>
                ))}
              </div>
              
              {goal.parentGoalId && (
                <div className="mt-3 text-xs text-gray-500">
                  Related to Long-Term Goal ID: {goal.parentGoalId}
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default ShortTermGoalList;