// src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context Providers
import { AuthProvider, useAuth } from './context/AuthContext';
import { GoalsProvider } from './context/GoalsContext';
import { TasksProvider } from './context/TasksContext';

// Pages
import Dashboard from './pages/Dashboard';
import Goals from './pages/Goals';
import Login from './pages/Login';
import Register from './pages/Register';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

// App component
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <GoalsProvider>
                  <TasksProvider>
                    <Dashboard />
                  </TasksProvider>
                </GoalsProvider>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/goals"
            element={
              <ProtectedRoute>
                <GoalsProvider>
                  <TasksProvider>
                    <Goals />
                  </TasksProvider>
                </GoalsProvider>
              </ProtectedRoute>
            }
          />
          
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      
      {/* Toast notifications */}
      <Toaster position="top-right" />
    </AuthProvider>
  );
};

export default App;