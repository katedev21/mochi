// src/pages/Goals.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  Target, 
  Plus, 
  Calendar,
  Flag,
  BarChart4,
  MoveRight,
  Milestone,
  RefreshCw,
  Settings,
  LogOut,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGoals } from '../context/GoalsContext';
import ShortTermGoalList from '../components/goals/ShortTermGoalList';

// Goal form component
const GoalForm = ({ 
  goalType = 'long-term', 
  onSubmit, 
  onCancel = () => {},
  initialData = null
}) => {
  // Get long-term goals for the dropdown
  const { longTermGoals } = useGoals();
  
  const [formData, setFormData] = useState(initialData || {
    title: '',
    description: '',
    targetDate: '',
    endDate: '',  // Added for short-term goals
    milestones: goalType === 'long-term' ? [{ title: '', targetDate: '', completed: false }] : [],
    parentGoalId: '',
    timeframe: goalType === 'short-term' ? 'weekly' : undefined
  });
  
  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  // Handle milestone changes (for long-term goals)
  const handleMilestoneChange = (index, field, value) => {
    const updatedMilestones = [...formData.milestones];
    updatedMilestones[index] = {
      ...updatedMilestones[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      milestones: updatedMilestones
    });
  };
  
  // Add new milestone
  const addMilestone = () => {
    setFormData({
      ...formData,
      milestones: [
        ...formData.milestones,
        { title: '', targetDate: '', completed: false }
      ]
    });
  };
  
  // Remove milestone
  const removeMilestone = (index) => {
    const updatedMilestones = [...formData.milestones];
    updatedMilestones.splice(index, 1);
    
    setFormData({
      ...formData,
      milestones: updatedMilestones
    });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Make a copy of the form data
    let submissionData = { ...formData };
    
    // If it's a short-term goal, ensure we're using the correct field names
    if (goalType === 'short-term') {
      // If endDate is empty but targetDate has a value, use targetDate value for endDate
      // This handles cases where the user might have entered a date in the wrong field
      if (!submissionData.endDate && submissionData.targetDate) {
        submissionData.endDate = submissionData.targetDate;
      }
    }
    
    onSubmit(submissionData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Goal Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Enter goal title"
          required
        />
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          placeholder="Enter goal description"
        />
      </div>
      
      <div>
        <label htmlFor={goalType === 'short-term' ? 'endDate' : 'targetDate'} className="block text-sm font-medium text-gray-700">
          {goalType === 'short-term' ? 'End Date *' : 'Target Date *'}
        </label>
        <input
          type="date"
          id={goalType === 'short-term' ? 'endDate' : 'targetDate'}
          name={goalType === 'short-term' ? 'endDate' : 'targetDate'}
          value={goalType === 'short-term' ? formData.endDate : formData.targetDate}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          required
        />
      </div>
      
      {goalType === 'short-term' && (
        <div>
          <label htmlFor="timeframe" className="block text-sm font-medium text-gray-700">
            Timeframe *
          </label>
          <select
            id="timeframe"
            name="timeframe"
            value={formData.timeframe}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          >
            <option value="">Select timeframe</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </div>
      )}
      
      {goalType === 'short-term' && (
        <div>
          <label htmlFor="parentGoalId" className="block text-sm font-medium text-gray-700">
            Related Long-Term Goal
          </label>
          <select
            id="parentGoalId"
            name="parentGoalId"
            value={formData.parentGoalId}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">None (Independent Goal)</option>
            {longTermGoals.map(goal => (
              <option key={goal.id} value={goal.id}>
                {goal.title}
              </option>
            ))}
          </select>
        </div>
      )}
      
      {goalType === 'long-term' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <label className="block text-sm font-medium text-gray-700">
              Milestones
            </label>
            <button
              type="button"
              onClick={addMilestone}
              className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Milestone
            </button>
          </div>
          
          {formData.milestones.map((milestone, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded-md space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-sm font-medium text-gray-700">Milestone {index + 1}</h4>
                {formData.milestones.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMilestone(index)}
                    className="text-red-600 hover:text-red-800 text-xs"
                  >
                    Remove
                  </button>
                )}
              </div>
              
              <div>
                <label htmlFor={`milestone-title-${index}`} className="block text-xs font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  id={`milestone-title-${index}`}
                  value={milestone.title}
                  onChange={(e) => handleMilestoneChange(index, 'title', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs"
                  placeholder="Milestone title"
                  required
                />
              </div>
              
              <div>
                <label htmlFor={`milestone-date-${index}`} className="block text-xs font-medium text-gray-700">
                  Target Date *
                </label>
                <input
                  type="date"
                  id={`milestone-date-${index}`}
                  value={milestone.targetDate}
                  onChange={(e) => handleMilestoneChange(index, 'targetDate', e.target.value)}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-xs"
                  required
                />
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          {initialData ? 'Update Goal' : 'Create Goal'}
        </button>
      </div>
    </form>
  );
};

// Long Term Goals component
const LongTermGoals = ({ goals, onGenerateShortTermGoals }) => {
  if (goals.length === 0) {
    return (
      <div className="text-center py-8">
        <Target className="h-12 w-12 text-gray-400 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-900">No long-term goals yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start by creating your first long-term goal to work towards
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {goals.map((goal) => (
        <div 
          key={goal.id}
          className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden"
        >
          <div className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
                {goal.description && (
                  <p className="mt-1 text-sm text-gray-500">{goal.description}</p>
                )}
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <Calendar className="h-4 w-4 mr-1.5 text-gray-400" />
                  {new Date(goal.targetDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </div>
              </div>
              
              <button
                onClick={() => onGenerateShortTermGoals(goal.id)}
                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Generate Short-Term Goals
              </button>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">Overall Progress</h4>
                <span className="text-sm text-gray-600">{goal.progress || 0}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${goal.progress || 0}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {goal.milestones && goal.milestones.length > 0 && (
            <div className="border-t border-gray-200 px-5 py-3 bg-gray-50">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                <Milestone className="h-4 w-4 mr-1.5 text-gray-500" />
                Milestones
              </h4>
              <div className="space-y-2">
                {goal.milestones.map((milestone, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`h-2 w-2 rounded-full ${milestone.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      <span className={`text-sm ${milestone.completed ? 'text-gray-500 line-through' : 'text-gray-700'}`}>
                        {milestone.title}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(milestone.targetDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
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

// Main Goals page component
const Goals = () => {
  const { user, logout } = useAuth();
  const { 
    longTermGoals, 
    shortTermGoals, 
    addLongTermGoal, 
    addShortTermGoal, 
    generateShortTermGoals,
    loading 
  } = useGoals();
  
  const [activeTab, setActiveTab] = useState('long-term');
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState('long-term');
  
  // Show form helper
  const handleShowForm = (type) => {
    setFormType(type);
    setShowForm(true);
  };
  
  // Handle goal creation
  const handleCreateGoal = async (goalData) => {
    try {
      if (formType === 'long-term') {
        await addLongTermGoal(goalData);
      } else {
        // Make sure we have all required fields for short-term goals
        if (!goalData.title || !goalData.timeframe || !goalData.endDate) {
          alert('Please fill in all required fields (Title, Timeframe, and End Date)');
          return;
        }
        
        // Create a properly formatted object for the API
        const shortTermGoalData = {
          title: goalData.title,
          description: goalData.description || '',
          timeframe: goalData.timeframe,
          endDate: goalData.endDate,
          parentGoalId: goalData.parentGoalId || null
        };
        
        await addShortTermGoal(shortTermGoalData);
      }
      
      setShowForm(false);
    } catch (error) {
      console.error('Error creating goal:', error);
      alert(`Failed to create goal: ${error.message || 'Unknown error'}`);
    }
  };
  
  // Handle generating short-term goals
  const handleGenerateShortTermGoals = async (longTermGoalId) => {
    try {
      await generateShortTermGoals(longTermGoalId);
    } catch (error) {
      console.error('Error generating short-term goals:', error);
    }
  };
  
  // Get short-term goals filtered by timeframe
  const getFilteredShortTermGoals = (timeframe) => {
    return shortTermGoals.filter(goal => goal.timeframe === timeframe);
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading your goals...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link to="/" className="mr-4 text-gray-500 hover:text-gray-700">
                <ChevronLeft className="h-5 w-5" />
              </Link>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Target className="h-6 w-6 text-blue-500 mr-2" />
                Goals
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link to="/settings" className="text-gray-500 hover:text-gray-700">
                <Settings className="h-6 w-6" />
              </Link>
              
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                  <User className="h-5 w-5" />
                </div>
                <span className="ml-2 text-gray-700">{user?.firstName || 'User'}</span>
              </div>
              
              <button 
                onClick={logout}
                className="text-red-500 hover:text-red-700"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Form Section */}
        {showForm ? (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h2 className="text-xl font-semibold mb-4">
              {formType === 'long-term' ? 'Create Long-Term Goal' : 'Create Short-Term Goal'}
            </h2>
            
            <GoalForm 
              goalType={formType}
              onSubmit={handleCreateGoal}
              onCancel={() => setShowForm(false)}
            />
          </div>
        ) : (
          <div className="mb-8 flex justify-between items-center">
            <div className="space-x-2">
              <button
                onClick={() => setActiveTab('long-term')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'long-term' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Long-Term Goals
              </button>
              <button
                onClick={() => setActiveTab('short-term')}
                className={`px-4 py-2 rounded-md text-sm font-medium ${
                  activeTab === 'short-term' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white text-gray-700 hover:bg-gray-50'
                }`}
              >
                Short-Term Goals
              </button>
            </div>
            
            <button
              onClick={() => handleShowForm(activeTab)}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="mr-2 h-5 w-5" />
              Add {activeTab === 'long-term' ? 'Long-Term' : 'Short-Term'} Goal
            </button>
          </div>
        )}
        
        {/* Goals Content */}
        {!showForm && (
          <div>
            {activeTab === 'long-term' ? (
              <LongTermGoals 
                goals={longTermGoals} 
                onGenerateShortTermGoals={handleGenerateShortTermGoals} 
              />
            ) : (
              <div className="space-y-8">
                {/* Daily Goals */}
                <section>
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Flag className="mr-2 h-5 w-5 text-green-500" />
                    Daily Goals
                  </h2>
                  <ShortTermGoalList goals={getFilteredShortTermGoals('daily')} />
                </section>
                
                {/* Weekly Goals */}
                <section>
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <BarChart4 className="mr-2 h-5 w-5 text-blue-500" />
                    Weekly Goals
                  </h2>
                  <ShortTermGoalList goals={getFilteredShortTermGoals('weekly')} />
                </section>
                
                {/* Monthly Goals */}
                <section>
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-purple-500" />
                    Monthly Goals
                  </h2>
                  <ShortTermGoalList goals={getFilteredShortTermGoals('monthly')} />
                </section>
                
                {/* Quarterly Goals */}
                <section>
                  <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <MoveRight className="mr-2 h-5 w-5 text-orange-500" />
                    Quarterly Goals
                  </h2>
                  <ShortTermGoalList goals={getFilteredShortTermGoals('quarterly')} />
                </section>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default Goals;