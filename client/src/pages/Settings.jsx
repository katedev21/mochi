// src/pages/Settings.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronLeft, 
  User, 
  Settings as SettingsIcon, 
  Save,
  Lock,
  LogOut,
  Bell,
  Globe,
  Moon,
  Volume2,
  CheckCircle,
  AlertTriangle,
  Mic
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user, updateProfile, logout, changePassword } = useAuth();
  
  // Profile form state
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    timezone: 'America/New_York'
  });
  
  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // Preferences state
  const [preferences, setPreferences] = useState({
    theme: 'light',
    notifications: true,
    soundEffects: true,
    voiceCommands: true,
    language: 'en'
  });
  
  // Loading states
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [preferencesLoading, setPreferencesLoading] = useState(false);
  
  // Initialize form data with user data
  useEffect(() => {
    if (user) {
      setProfileData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        timezone: user.timezone || 'America/New_York'
      });
      
      if (user.preferences) {
        setPreferences(user.preferences);
      }
    }
  }, [user]);
  
  // Handle profile form input changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value
    });
  };
  
  // Handle password form input changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };
  
  // Handle preferences changes
  const handlePreferenceChange = (name, value) => {
    setPreferences({
      ...preferences,
      [name]: value
    });
  };
  
  // Handle toggle input changes
  const handleToggleChange = (e) => {
    const { name, checked } = e.target;
    handlePreferenceChange(name, checked);
  };
  
  // Handle profile form submission
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    
    try {
      const result = await updateProfile(profileData);
      
      if (result.success) {
        toast.success('Profile updated successfully');
      } else {
        toast.error(result.error || 'Failed to update profile');
      }
    } catch (error) {
      toast.error('An error occurred while updating profile');
      console.error('Profile update error:', error);
    } finally {
      setProfileLoading(false);
    }
  };
  
  // Handle password form submission
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    
    setPasswordLoading(true);
    
    try {
      const result = await changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      if (result.success) {
        toast.success('Password changed successfully');
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        toast.error(result.error || 'Failed to change password');
      }
    } catch (error) {
      toast.error('An error occurred while changing password');
      console.error('Password change error:', error);
    } finally {
      setPasswordLoading(false);
    }
  };
  
  // Handle preferences form submission
  const handlePreferencesSubmit = async (e) => {
    e.preventDefault();
    setPreferencesLoading(true);
    
    try {
      // In a real app, you would save this to the backend
      // Here we'll just simulate it
      setTimeout(() => {
        toast.success('Preferences updated successfully');
        setPreferencesLoading(false);
      }, 1000);
    } catch (error) {
      toast.error('An error occurred while updating preferences');
      console.error('Preferences update error:', error);
      setPreferencesLoading(false);
    }
  };
  
  // Available languages
  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ru', name: 'Russian' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' }
  ];
  
  // Available timezones (simplified list)
  const timezones = [
    'America/New_York',
    'America/Chicago',
    'America/Denver',
    'America/Los_Angeles',
    'Europe/London',
    'Europe/Paris',
    'Asia/Tokyo',
    'Australia/Sydney',
    'Pacific/Auckland'
  ];
  
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
                <SettingsIcon className="h-6 w-6 text-blue-500 mr-2" />
                Settings
              </h1>
            </div>
            
            <div className="flex items-center">
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white mr-2">
                <User className="h-5 w-5" />
              </div>
              <span className="mr-4 text-gray-700">{user?.firstName || 'User'}</span>
              
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-blue-50">
                <h3 className="text-lg font-medium leading-6 text-gray-900">Settings</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Manage your account and preferences
                </p>
              </div>
              <div className="bg-white" role="list">
                <a href="#profile" className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center">
                      <User className="h-5 w-5 text-gray-500 mr-2" />
                      <p className="text-sm font-medium text-blue-600 truncate">
                        Profile
                      </p>
                    </div>
                  </div>
                </a>
                <a href="#security" className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center">
                      <Lock className="h-5 w-5 text-gray-500 mr-2" />
                      <p className="text-sm font-medium text-gray-600 truncate">
                        Security
                      </p>
                    </div>
                  </div>
                </a>
                <a href="#preferences" className="block hover:bg-gray-50">
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center">
                      <SettingsIcon className="h-5 w-5 text-gray-500 mr-2" />
                      <p className="text-sm font-medium text-gray-600 truncate">
                        Preferences
                      </p>
                    </div>
                  </div>
                </a>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Profile Section */}
            <section id="profile" className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-blue-50">
                <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                  <User className="h-5 w-5 text-blue-500 mr-2" />
                  Profile Information
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Update your personal information
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <form onSubmit={handleProfileSubmit}>
                  <div className="grid grid-cols-6 gap-6">
                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                        First name
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        value={profileData.firstName}
                        onChange={handleProfileChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                        Last name
                      </label>
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        value={profileData.lastName}
                        onChange={handleProfileChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email address
                      </label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={profileData.email}
                        onChange={handleProfileChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>

                    <div className="col-span-6 sm:col-span-3">
                      <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
                        Timezone
                      </label>
                      <select
                        id="timezone"
                        name="timezone"
                        value={profileData.timezone}
                        onChange={handleProfileChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        {timezones.map((tz) => (
                          <option key={tz} value={tz}>
                            {tz.replace('_', ' ')}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={profileLoading}
                      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        profileLoading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      <Save className={`h-5 w-5 mr-2 ${profileLoading ? 'animate-spin' : ''}`} />
                      {profileLoading ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              </div>
            </section>
            
            {/* Security Section */}
            <section id="security" className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-blue-50">
                <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                  <Lock className="h-5 w-5 text-blue-500 mr-2" />
                  Security
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Update your password
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <form onSubmit={handlePasswordSubmit}>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        id="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        id="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        id="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={passwordLoading}
                      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        passwordLoading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      <Save className={`h-5 w-5 mr-2 ${passwordLoading ? 'animate-spin' : ''}`} />
                      {passwordLoading ? 'Changing...' : 'Change Password'}
                    </button>
                  </div>
                </form>
              </div>
            </section>
            
            {/* Preferences Section */}
            <section id="preferences" className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:px-6 bg-blue-50">
                <h3 className="text-lg font-medium leading-6 text-gray-900 flex items-center">
                  <SettingsIcon className="h-5 w-5 text-blue-500 mr-2" />
                  Preferences
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Customize your app experience
                </p>
              </div>
              <div className="px-4 py-5 sm:p-6">
                <form onSubmit={handlePreferencesSubmit}>
                  <div className="space-y-6">
                    {/* Theme Preference */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 flex items-center">
                        <Moon className="h-5 w-5 text-gray-500 mr-2" />
                        Theme
                      </label>
                      <p className="text-sm text-gray-500 mb-2">Choose your preferred theme</p>
                      <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="theme"
                            checked={preferences.theme === 'light'}
                            onChange={() => handlePreferenceChange('theme', 'light')}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Light</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="theme"
                            checked={preferences.theme === 'dark'}
                            onChange={() => handlePreferenceChange('theme', 'dark')}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Dark</span>
                        </label>
                        <label className="inline-flex items-center">
                          <input
                            type="radio"
                            name="theme"
                            checked={preferences.theme === 'system'}
                            onChange={() => handlePreferenceChange('theme', 'system')}
                            className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">System</span>
                        </label>
                      </div>
                    </div>
                    
                    {/* Language Preference */}
                    <div>
                      <label htmlFor="language" className="text-sm font-medium text-gray-700 flex items-center">
                        <Globe className="h-5 w-5 text-gray-500 mr-2" />
                        Language
                      </label>
                      <p className="text-sm text-gray-500 mb-2">Select your preferred language</p>
                      <select
                        id="language"
                        name="language"
                        value={preferences.language}
                        onChange={(e) => handlePreferenceChange('language', e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      >
                        {languages.map((lang) => (
                          <option key={lang.code} value={lang.code}>
                            {lang.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Toggle Preferences */}
                    <div className="space-y-4">
                      {/* Notifications */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-start">
                          <div className="flex items-center">
                            <Bell className="h-5 w-5 text-gray-500 mr-2" />
                          </div>
                          <div className="ml-2">
                            <label htmlFor="notifications" className="text-sm font-medium text-gray-700">
                              Notifications
                            </label>
                            <p className="text-sm text-gray-500">
                              Receive notifications about your goals and tasks
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="notifications"
                            name="notifications"
                            type="checkbox"
                            checked={preferences.notifications}
                            onChange={handleToggleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          {preferences.notifications ? (
                            <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="ml-2 h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      {/* Sound Effects */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-start">
                          <div className="flex items-center">
                            <Volume2 className="h-5 w-5 text-gray-500 mr-2" />
                          </div>
                          <div className="ml-2">
                            <label htmlFor="soundEffects" className="text-sm font-medium text-gray-700">
                              Sound Effects
                            </label>
                            <p className="text-sm text-gray-500">
                              Enable sound effects for interactions
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="soundEffects"
                            name="soundEffects"
                            type="checkbox"
                            checked={preferences.soundEffects}
                            onChange={handleToggleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          {preferences.soundEffects ? (
                            <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="ml-2 h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                      
                      {/* Voice Commands */}
                      <div className="flex justify-between items-center">
                        <div className="flex items-start">
                          <div className="flex items-center">
                            <Mic className="h-5 w-5 text-gray-500 mr-2" />
                          </div>
                          <div className="ml-2">
                            <label htmlFor="voiceCommands" className="text-sm font-medium text-gray-700">
                              Voice Commands
                            </label>
                            <p className="text-sm text-gray-500">
                              Enable voice command functionality
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="voiceCommands"
                            name="voiceCommands"
                            type="checkbox"
                            checked={preferences.voiceCommands}
                            onChange={handleToggleChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          {preferences.voiceCommands ? (
                            <CheckCircle className="ml-2 h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="ml-2 h-5 w-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={preferencesLoading}
                      className={`inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                        preferencesLoading ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      <Save className={`h-5 w-5 mr-2 ${preferencesLoading ? 'animate-spin' : ''}`} />
                      {preferencesLoading ? 'Saving...' : 'Save Preferences'}
                    </button>
                  </div>
                </form>
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Settings;