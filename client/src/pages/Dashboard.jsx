// src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  Mic, 
  MessageCircle, 
  CheckSquare, 
  Target, 
  RefreshCw, 
  AudioLines,
  Zap,
  Calendar,
  Clock,
  Settings,
  LogOut,
  BarChart2,
  User,
  PlusCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

// Components
import TaskList from '../components/tasks/TaskList';
import ShortTermGoalList from '../components/goals/ShortTermGoalList';
import ChatInterface from '../components/voice/ChatInterface';
import VoiceInput from '../components/voice/VoiceInput';

// Hooks and Context
import { useAuth } from '../context/AuthContext';
import { useGoals } from '../context/GoalsContext';
import { useTasks } from '../context/TasksContext';
import useVoiceRecognition from '../hooks/useVoiceRecognition';

// Services
import { processVoiceCommand, generateResponse } from '../services/voiceCommandProcessor';
import { getAISuggestions } from '../api/voice';

const Dashboard = () => {
  // Get data from context
  const { user, logout } = useAuth();
  const { longTermGoals, shortTermGoals, loading: goalsLoading } = useGoals();
  const { dailyTasks, tasks, loading: tasksLoading } = useTasks();
  
  // Local state
  const [chatMessages, setChatMessages] = useState([
    { 
      id: 1, 
      text: `Hi ${user?.firstName || 'there'}! I'm your productivity assistant. How can I help you today?`, 
      type: 'assistant' 
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  // Refs
  const chatContainerRef = useRef(null);
  
  // Format date helper
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Voice recognition setup
  const handleVoiceResult = (result) => {
    if (result) {
      // Add user message to chat
      const userMessage = {
        id: chatMessages.length + 1,
        text: result,
        type: 'user'
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      processCommand(result);
    }
  };
  
  const { 
    isListening, 
    supported, 
    error: voiceError, 
    toggleListening 
  } = useVoiceRecognition({
    onResult: handleVoiceResult,
    onError: (err) => toast.error(`Voice recognition error: ${err}`),
    continuous: false
  });
  
  // Process command (from voice or text)
  const processCommand = async (command) => {
    // Process the command to determine intent and entities
    const processedCommand = processVoiceCommand(command);
    
    // Generate a response based on the processed command
    const responseText = generateResponse(processedCommand);
    
    // Add assistant response to chat
    setTimeout(() => {
      const assistantMessage = {
        id: chatMessages.length + 2,
        text: responseText,
        type: 'assistant'
      };
      
      setChatMessages(prev => [...prev, assistantMessage]);
      
      // Execute actions based on the intent
      executeAction(processedCommand);
    }, 500);
  };
  
  // Execute actions based on the processed command
  const executeAction = async (processedCommand) => {
    const { intent, entities } = processedCommand;
    
    // If no intent was detected, stop here
    if (!intent) return;
    
    try {
      switch (intent) {
        // Implementation for each intent...
        // This would call the appropriate functions from context providers
        // For brevity, this is just a skeleton
      }
    } catch (error) {
      console.error('Error executing action:', error);
      toast.error('Something went wrong while processing your request');
    }
  };
  
  // Get AI suggestions
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (longTermGoals.length === 0 || tasks.length === 0) return;
      
      try {
        const context = {
          goals: longTermGoals,
          shortTermGoals,
          tasks
        };
        
        const aiSuggestions = await getAISuggestions(context);
        setSuggestions(aiSuggestions);
      } catch (error) {
        console.error('Error fetching AI suggestions:', error);
      }
    };
    
    fetchSuggestions();
  }, [longTermGoals, shortTermGoals, tasks]);
  
  // Handle text input submission
  const handleTextSubmit = (e) => {
    e.preventDefault();
    
    if (inputText.trim()) {
      // Add user message to chat
      const userMessage = {
        id: chatMessages.length + 1,
        text: inputText,
        type: 'user'
      };
      
      setChatMessages(prev => [...prev, userMessage]);
      processCommand(inputText);
      
      // Clear input
      setInputText('');
    }
  };
  
  // Scroll chat to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);
  
  // Loading state
  if (goalsLoading || tasksLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-lg">Loading your productivity data...</p>
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
              <Zap className="h-8 w-8 text-yellow-500" />
              <h1 className="ml-2 text-2xl font-bold text-gray-900">Voice Productivity Assistant</h1>
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left 2/3 */}
          <div className="lg:col-span-2 space-y-8">
            {/* Today's Overview */}
            <section className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                <Calendar className="mr-2 text-blue-500" />
                Today's Overview
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-700">Daily Tasks</h3>
                  <p className="text-2xl font-bold">{dailyTasks.length}</p>
                  <p className="text-sm text-blue-600">
                    {dailyTasks.filter(t => t.completed).length} completed
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <h3 className="font-medium text-green-700">Active Goals</h3>
                  <p className="text-2xl font-bold">{shortTermGoals.filter(g => !g.completed).length}</p>
                  <p className="text-sm text-green-600">
                    {shortTermGoals.filter(g => g.timeframe === 'daily').length} daily goals
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <h3 className="font-medium text-purple-700">Focus Time</h3>
                  <p className="text-2xl font-bold">
                    {dailyTasks.reduce((acc, task) => acc + (task.estimatedTime || 0), 0)} mins
                  </p>
                  <p className="text-sm text-purple-600">
                    Planned for today
                  </p>
                </div>
              </div>
            </section>
            
            {/* Daily Tasks */}
            <section className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <CheckSquare className="mr-2 text-purple-500" /> 
                  Daily Tasks
                </h2>
                
                <Link 
                  to="/tasks"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  <PlusCircle className="mr-1 h-4 w-4" />
                  Add Task
                </Link>
              </div>
              
              <TaskList tasks={dailyTasks} />
            </section>
            
            {/* Short Term Goals */}
            <section className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <Target className="mr-2 text-green-500" /> 
                  Short-Term Goals
                </h2>
                
                <Link 
                  to="/goals"
                  className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
                >
                  View All Goals
                </Link>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-medium text-gray-700">Active This Week</h3>
                <ShortTermGoalList 
                  goals={shortTermGoals.filter(g => 
                    g.timeframe === 'weekly' && !g.completed
                  )} 
                />
              </div>
            </section>
          </div>
          
          {/* Assistant Panel - Right 1/3 */}
          <div className="lg:col-span-1 space-y-8">
            {/* Assistant Chat */}
            <section className="bg-white rounded-lg shadow p-6 h-[calc(100vh-12rem)] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center">
                  <MessageCircle className="mr-2 text-blue-500" /> 
                  Voice Assistant
                </h2>
                
                <button 
                  onClick={toggleListening}
                  className={`
                    p-2 rounded-full
                    ${isListening ? 'bg-red-200 text-red-800' : 'bg-blue-200 text-blue-800'}
                  `}
                  disabled={!supported}
                >
                  {isListening ? <AudioLines className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                </button>
              </div>
              
              {!supported && (
                <div className="mb-4 bg-yellow-100 text-yellow-800 p-3 rounded-md text-sm">
                  Voice recognition is not supported in your browser. Please use the text input instead.
                </div>
              )}
              
              {voiceError && (
                <div className="mb-4 bg-red-100 text-red-800 p-3 rounded-md text-sm">
                  Error: {voiceError}
                </div>
              )}
              
              <div 
                ref={chatContainerRef}
                className="flex-grow overflow-y-auto bg-gray-50 p-4 rounded-lg mb-4"
              >
                <ChatInterface messages={chatMessages} />
              </div>
              
              <form onSubmit={handleTextSubmit} className="flex">
                <input 
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Type a message or command..."
                  className="flex-grow p-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button 
                  type="submit"
                  className="bg-blue-500 text-white p-2 rounded-r-lg hover:bg-blue-600"
                >
                  <MessageCircle className="h-5 w-5" />
                </button>
              </form>
            </section>
            
            {/* AI Suggestions */}
            {suggestions.length > 0 && (
              <section className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold flex items-center">
                    <RefreshCw className="mr-2 text-indigo-500" /> 
                    Suggestions
                  </h2>
                  
                  <button 
                    onClick={() => setShowSuggestions(!showSuggestions)}
                    className="text-gray-500"
                  >
                    {showSuggestions ? 'Hide' : 'Show'}
                  </button>
                </div>
                
                {showSuggestions && (
                  <div className="space-y-3">
                    {suggestions.map((suggestion, index) => (
                      <div 
                        key={index} 
                        className="bg-indigo-50 p-3 rounded-lg text-sm"
                      >
                        <p className="font-medium text-indigo-800">{suggestion.title}</p>
                        <p className="text-indigo-600">{suggestion.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;