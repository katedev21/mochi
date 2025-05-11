// src/components/goals/LongTermGoalList.jsx
import React, { useState } from 'react';
import { CheckCircle, Trash2, Calendar, BarChart4, ChevronDown, ChevronUp, Target } from 'lucide-react';
import { useGoals } from '../../context/GoalsContext';
import { useTasks } from '../../context/TasksContext';

const LongTermGoalList = ({ goals = [], showMilestones = true }) => {
  const { updateLongTermGoal, deleteLongTermGoal, generateShortTermGoals } = useGoals();
  const { generateTasksFromGoal } = useTasks();
  const [expandedGoalId, setExpandedGoalId] = useState(null);

  // Toggle goal expansion
  const toggleExpand = (goalId) => {
    setExpandedGoalId(expandedGoalId === goalId ? null : goalId);
  };

  // Toggle completion status
  const handleToggleComplete = async (goal) => {
    try {
      await updateLongTermGoal(goal.id, { 
        completed: !goal.completed,
        progress: !goal.completed ? 100 : goal.progress
      });
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  // Delete goal
  const handleDelete = async (goalId) => {
    if (window.confirm('Are you sure you want to delete this goal? This will also remove related short-term goals.')) {
      try {
        await deleteLongTermGoal(goalId);
      } catch (error) {
        console.error('Error deleting goal:', error);
      }
    }
  };

  // Generate short-term goals from this long-term goal
  const handleGenerateShortTermGoals = async (goalId) => {
    try {
      await generateShortTermGoals(goalId);
    } catch (error) {
      console.error('Error generating short-term goals:', error);
    }
  };

  // Generate tasks from goal
  const handleGenerateTasks = async (goalId) => {
    try {
      await generateTasksFromGoal(goalId, 'long-term');
    } catch (error) {
      console.error('Error generating tasks:', error);
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
        <p>No long-term goals to display.</p>
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
                    className={`font-medium ${goal.completed ? 'text-gray-500' : 'text-gray-800'} cursor-pointer`}
                    onClick={() => toggleExpand(goal.id)}
                  >
                    {goal.title}
                  </h3>
                  
                  <div className="flex items-center mt-1 space-x-2">
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      Long-term
                    </span>
                    
                    {goal.targetDate && (
                      <span className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" /> 
                        {formatDate(goal.targetDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleGenerateShortTermGoals(goal.id)}
                  className="p-1 text-blue-500 hover:text-blue-700 transition-colors"
                  title="Generate Short-Term Goals"
                >
                  <Target className="h-4 w-4" />
                </button>
                
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
                
                <button
                  onClick={() => toggleExpand(goal.id)}
                  className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                  title={expandedGoalId === goal.id ? "Collapse" : "Expand"}
                >
                  {expandedGoalId === goal.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
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
          
          {expandedGoalId === goal.id && showMilestones && goal.milestones && goal.milestones.length > 0 && (
            <div className="px-4 pb-4 pt-2 border-t border-gray-200">
              {goal.description && (
                <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
              )}
              
              <h4 className="text-sm font-medium text-gray-700 mb-2">Milestones:</h4>
              <div className="space-y-2">
                {goal.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`h-2 w-2 rounded-full ${milestone.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-sm ${milestone.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                        {milestone.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {formatDate(milestone.targetDate)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default LongTermGoalList;