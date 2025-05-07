// server.js
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import { User, LongTermGoal, ShortTermGoal, Task } from './models/index.js';

// Load env vars
dotenv.config();

// Connect to MongoDB
connectDB();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Helper Functions
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: '7d' });
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.id;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized: Invalid token' });
  }
};

// Routes

// Authentication Routes
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }
    
    // Generate token
    const token = generateToken(user._id);
    
    // Don't send password in response
    user.password = undefined;
    
    res.json({ 
      token, 
      user
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if user already exists
    const userExists = await User.findOne({ email });
    
    if (userExists) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }
    
    // Create new user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password
    });
    
    // Generate token
    const token = generateToken(user._id);
    
    // Don't send password in response
    user.password = undefined;
    
    res.status(201).json({ 
      token, 
      user
    });
  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/auth/profile', verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, email, timezone } = req.body;
    
    // Find user
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update user information
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (email) user.email = email;
    if (timezone) user.timezone = timezone;
    
    await user.save();
    
    // Don't send password in response
    user.password = undefined;
    
    res.json({ user });
  } catch (error) {
    console.error('Profile update error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/auth/change-password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Find user
    const user = await User.findById(req.userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if current password is correct
    const isMatch = await user.matchPassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Goals Routes
app.get('/api/goals', verifyToken, async (req, res) => {
  try {
    // Find user's goals
    const longTermGoals = await LongTermGoal.find({ user: req.userId });
    const shortTermGoals = await ShortTermGoal.find({ user: req.userId });
    
    res.json({
      longTermGoals,
      shortTermGoals
    });
  } catch (error) {
    console.error('Goals fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/goals/long-term', verifyToken, async (req, res) => {
  try {
    const { title, description, targetDate, milestones } = req.body;
    
    if (!title || !targetDate) {
      return res.status(400).json({ message: 'Title and target date are required' });
    }
    
    // Create new goal
    const goal = await LongTermGoal.create({
      user: req.userId,
      title,
      description: description || '',
      targetDate,
      milestones: milestones || []
    });
    
    res.status(201).json({ goal });
  } catch (error) {
    console.error('Goal creation error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/goals/short-term', verifyToken, async (req, res) => {
  try {
    const { title, description, timeframe, endDate, parentGoalId } = req.body;
    
    if (!title || !timeframe || !endDate) {
      return res.status(400).json({ message: 'Title, timeframe, and end date are required' });
    }
    
    // Create new goal
    const goal = await ShortTermGoal.create({
      user: req.userId,
      title,
      description: description || '',
      timeframe,
      endDate,
      parentGoal: parentGoalId || null
    });
    
    res.status(201).json({ goal });
  } catch (error) {
    console.error('Goal creation error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/goals/long-term/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, targetDate, progress, completed, milestones } = req.body;
    
    // Find goal
    const goal = await LongTermGoal.findOne({ _id: id, user: req.userId });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    // Update goal
    if (title) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (targetDate) goal.targetDate = targetDate;
    if (progress !== undefined) goal.progress = progress;
    if (completed !== undefined) goal.completed = completed;
    if (milestones) goal.milestones = milestones;
    
    await goal.save();
    
    res.json({ goal });
  } catch (error) {
    console.error('Goal update error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/goals/short-term/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, timeframe, endDate, parentGoalId, progress, completed } = req.body;
    
    // Find goal
    const goal = await ShortTermGoal.findOne({ _id: id, user: req.userId });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    // Update goal
    if (title) goal.title = title;
    if (description !== undefined) goal.description = description;
    if (timeframe) goal.timeframe = timeframe;
    if (endDate) goal.endDate = endDate;
    if (parentGoalId !== undefined) goal.parentGoal = parentGoalId;
    if (progress !== undefined) goal.progress = progress;
    if (completed !== undefined) goal.completed = completed;
    
    await goal.save();
    
    res.json({ goal });
  } catch (error) {
    console.error('Goal update error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/goals/long-term/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find goal
    const goal = await LongTermGoal.findOne({ _id: id, user: req.userId });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    // Delete goal
    await goal.remove();
    
    // Also delete any short-term goals associated with this long-term goal
    await ShortTermGoal.deleteMany({ parentGoal: id });
    
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Goal deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/goals/short-term/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find goal
    const goal = await ShortTermGoal.findOne({ _id: id, user: req.userId });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    // Delete goal
    await goal.remove();
    
    res.json({ message: 'Goal deleted successfully' });
  } catch (error) {
    console.error('Goal deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Milestone Routes
app.post('/api/goals/long-term/:goalId/milestones', verifyToken, async (req, res) => {
  try {
    const { goalId } = req.params;
    const { title, targetDate } = req.body;
    
    // Find goal
    const goal = await LongTermGoal.findOne({ _id: goalId, user: req.userId });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    if (!title || !targetDate) {
      return res.status(400).json({ message: 'Title and target date are required' });
    }
    
    // Add milestone
    goal.milestones.push({
      title,
      targetDate,
      completed: false
    });
    
    await goal.save();
    
    res.status(201).json({ goal });
  } catch (error) {
    console.error('Milestone creation error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/goals/long-term/:goalId/milestones/:milestoneId', verifyToken, async (req, res) => {
  try {
    const { goalId, milestoneId } = req.params;
    const { title, targetDate, completed } = req.body;
    
    // Find goal
    const goal = await LongTermGoal.findOne({ _id: goalId, user: req.userId });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    // Find milestone
    const milestone = goal.milestones.id(milestoneId);
    
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    
    // Update milestone
    if (title) milestone.title = title;
    if (targetDate) milestone.targetDate = targetDate;
    if (completed !== undefined) milestone.completed = completed;
    
    // Calculate goal progress based on completed milestones
    const totalMilestones = goal.milestones.length;
    const completedMilestones = goal.milestones.filter(m => m.completed).length;
    
    if (totalMilestones > 0) {
      goal.progress = Math.round((completedMilestones / totalMilestones) * 100);
      goal.completed = goal.progress === 100;
    }
    
    await goal.save();
    
    res.json({ goal });
  } catch (error) {
    console.error('Milestone update error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/goals/long-term/:goalId/milestones/:milestoneId', verifyToken, async (req, res) => {
  try {
    const { goalId, milestoneId } = req.params;
    
    // Find goal
    const goal = await LongTermGoal.findOne({ _id: goalId, user: req.userId });
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    // Find milestone
    const milestone = goal.milestones.id(milestoneId);
    
    if (!milestone) {
      return res.status(404).json({ message: 'Milestone not found' });
    }
    
    // Remove milestone
    goal.milestones.pull(milestoneId);
    
    // Recalculate goal progress
    const totalMilestones = goal.milestones.length;
    const completedMilestones = goal.milestones.filter(m => m.completed).length;
    
    if (totalMilestones > 0) {
      goal.progress = Math.round((completedMilestones / totalMilestones) * 100);
      goal.completed = goal.progress === 100;
    } else {
      goal.progress = 0;
      goal.completed = false;
    }
    
    await goal.save();
    
    res.json({ goal });
  } catch (error) {
    console.error('Milestone deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Tasks Routes
app.get('/api/tasks', verifyToken, async (req, res) => {
  try {
    // Find user's tasks
    const tasks = await Task.find({ user: req.userId });
    
    res.json({ tasks });
  } catch (error) {
    console.error('Tasks fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/tasks', verifyToken, async (req, res) => {
  try {
    const { title, description, estimatedTime, dueDate, priority, relatedGoalId, daily } = req.body;
    
    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    // Create new task
    const task = await Task.create({
      user: req.userId,
      title,
      description: description || '',
      estimatedTime: estimatedTime || null,
      dueDate: dueDate || null,
      priority: priority || 'medium',
      relatedGoal: relatedGoalId || null,
      daily: daily || false
    });
    
    res.status(201).json({ task });
  } catch (error) {
    console.error('Task creation error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/tasks/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed, estimatedTime, dueDate, priority, relatedGoalId, daily } = req.body;
    
    // Find task
    const task = await Task.findOne({ _id: id, user: req.userId });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Update task
    if (title) task.title = title;
    if (description !== undefined) task.description = description;
    if (completed !== undefined) task.completed = completed;
    if (estimatedTime !== undefined) task.estimatedTime = estimatedTime;
    if (dueDate !== undefined) task.dueDate = dueDate;
    if (priority) task.priority = priority;
    if (relatedGoalId !== undefined) task.relatedGoal = relatedGoalId;
    if (daily !== undefined) task.daily = daily;
    
    await task.save();
    
    res.json({ task });
  } catch (error) {
    console.error('Task update error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

app.delete('/api/tasks/:id', verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find task
    const task = await Task.findOne({ _id: id, user: req.userId });
    
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    
    // Delete task
    await task.remove();
    
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Task deletion error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.put('/api/tasks/batch', verifyToken, async (req, res) => {
  try {
    const { tasks: taskUpdates } = req.body;
    
    if (!taskUpdates || !Array.isArray(taskUpdates)) {
      return res.status(400).json({ message: 'Tasks must be an array' });
    }
    
    const updatedTasks = [];
    
    for (const update of taskUpdates) {
      if (!update._id) {
        continue;
      }
      
      // Find and update task
      const task = await Task.findOne({ _id: update._id, user: req.userId });
      
      if (!task) {
        continue;
      }
      
      // Apply updates
      Object.keys(update).forEach(key => {
        if (key !== '_id' && update[key] !== undefined) {
          task[key] = update[key];
        }
      });
      
      await task.save();
      updatedTasks.push(task);
    }
    
    res.json({ tasks: updatedTasks });
  } catch (error) {
    console.error('Batch task update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Voice/AI Routes
app.post('/api/voice/process', verifyToken, async (req, res) => {
  try {
    const { text } = req.body;
    
    // This is a mock implementation
    // In a real app, this would connect to an NLP service
    
    let intent = null;
    const entities = {};
    
    // Simple intent matching
    if (text.toLowerCase().includes('show') && text.toLowerCase().includes('goal')) {
      intent = 'SHOW_GOALS';
      
      if (text.toLowerCase().includes('long-term')) {
        entities.goalType = 'long-term';
      } else if (text.toLowerCase().includes('short-term')) {
        entities.goalType = 'short-term';
      }
    } else if (text.toLowerCase().includes('show') && text.toLowerCase().includes('task')) {
      intent = 'SHOW_TASKS';
    } else if (text.toLowerCase().includes('add') && text.toLowerCase().includes('goal')) {
      intent = 'ADD_GOAL';
      
      if (text.toLowerCase().includes('long-term')) {
        entities.goalType = 'long-term';
      } else if (text.toLowerCase().includes('short-term')) {
        entities.goalType = 'short-term';
      }
      
      // Extract title if in quotes
      const titleMatch = text.match(/"([^"]+)"/);
      if (titleMatch) {
        entities.title = titleMatch[1];
      }
    } else if (text.toLowerCase().includes('add') && text.toLowerCase().includes('task')) {
      intent = 'CREATE_TASK';
      
      // Extract title if in quotes
      const titleMatch = text.match(/"([^"]+)"/);
      if (titleMatch) {
        entities.taskTitle = titleMatch[1];
      }
    } else if (text.toLowerCase().includes('help')) {
      intent = 'HELP';
    }
    
    res.json({
      result: {
        intent,
        entities,
        originalText: text
      }
    });
  } catch (error) {
    console.error('Voice processing error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/ai/suggestions', verifyToken, async (req, res) => {
  try {
    // Get user's goals and tasks for context
    const longTermGoals = await LongTermGoal.find({ user: req.userId });
    const shortTermGoals = await ShortTermGoal.find({ user: req.userId });
    const tasks = await Task.find({ user: req.userId });
    
    // In a real app, this would use an AI service to generate personalized suggestions
    // This is a mock implementation with static suggestions
    const suggestions = [
      {
        title: 'Focus on Your React Learning',
        description: 'You\'re making good progress on your React course. Consider allocating more time to complete it this week.'
      },
      {
        title: 'Exercise Routine',
        description: 'You\'ve only completed 1 of 3 planned workouts this week. Try to schedule your remaining sessions today.'
      },
      {
        title: 'Reading Goal',
        description: 'You\'re 60% through "Atomic Habits". Reading just 20 pages per day will help you complete it by the end of the month.'
      }
    ];
    
    res.json({ suggestions });
  } catch (error) {
    console.error('AI suggestions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/ai/generate/short-term-goals', verifyToken, async (req, res) => {
  try {
    const { longTermGoalId } = req.body;
    
    // Find the long-term goal
    const longTermGoal = await LongTermGoal.findOne({ _id: longTermGoalId, user: req.userId });
    
    if (!longTermGoal) {
      return res.status(404).json({ message: 'Long-term goal not found' });
    }
    
    // In a real app, this would use an AI service to generate personalized goals
    // This is a simple implementation that creates basic goals
    
    const now = new Date();
    const oneDay = new Date(now);
    oneDay.setDate(now.getDate() + 1);
    
    const oneWeek = new Date(now);
    oneWeek.setDate(now.getDate() + 7);
    
    const oneMonth = new Date(now);
    oneMonth.setMonth(now.getMonth() + 1);
    
    // Create short-term goals
    const createdGoals = await ShortTermGoal.create([
      {
        user: req.userId,
        parentGoal: longTermGoalId,
        title: `Daily Progress: ${longTermGoal.title}`,
        description: `Take one small step toward ${longTermGoal.title}`,
        timeframe: 'daily',
        endDate: oneDay,
        progress: 0,
        completed: false
      },
      {
        user: req.userId,
        parentGoal: longTermGoalId,
        title: `Weekly Plan: ${longTermGoal.title}`,
        description: `Make measurable progress toward ${longTermGoal.title} this week`,
        timeframe: 'weekly',
        endDate: oneWeek,
        progress: 0,
        completed: false
      },
      {
        user: req.userId,
        parentGoal: longTermGoalId,
        title: `Monthly Milestone: ${longTermGoal.title}`,
        description: `Complete a significant portion of work needed for ${longTermGoal.title}`,
        timeframe: 'monthly',
        endDate: oneMonth,
        progress: 0,
        completed: false
      }
    ]);
    
    res.json({ goals: createdGoals });
  } catch (error) {
    console.error('Generate short-term goals error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

app.post('/api/ai/generate/tasks', verifyToken, async (req, res) => {
  try {
    const { goalId, goalType } = req.body;
    
    // Find the goal
    let goal;
    if (goalType === 'long-term') {
      goal = await LongTermGoal.findOne({ _id: goalId, user: req.userId });
    } else {
      goal = await ShortTermGoal.findOne({ _id: goalId, user: req.userId });
    }
    
    if (!goal) {
      return res.status(404).json({ message: 'Goal not found' });
    }
    
    // In a real app, this would use an AI service to generate personalized tasks
    // This is a simple implementation that creates basic tasks
    
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    
    const threeDays = new Date(now);
    threeDays.setDate(now.getDate() + 3);
    
    // Create tasks
    const createdTasks = await Task.create([
      {
        user: req.userId,
        title: `Research: ${goal.title}`,
        description: `Spend 30 minutes researching best approaches for ${goal.title}`,
        completed: false,
        estimatedTime: 30,
        dueDate: now,
        priority: 'high',
        relatedGoal: goalId
      },
      {
        user: req.userId,
        title: `Plan: ${goal.title}`,
        description: `Create a detailed action plan for ${goal.title}`,
        completed: false,
        estimatedTime: 45,
        dueDate: tomorrow,
        priority: 'medium',
        relatedGoal: goalId
      },
      {
        user: req.userId,
        title: `First action for ${goal.title}`,
        description: `Complete the first concrete action for ${goal.title}`,
        completed: false,
        estimatedTime: 60,
        dueDate: threeDays,
        priority: 'medium',
        relatedGoal: goalId
      }
    ]);
    
    res.json({ tasks: createdTasks });
  } catch (error) {
    console.error('Generate tasks error:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(val => val.message);
      return res.status(400).json({ message: messages.join(', ') });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});