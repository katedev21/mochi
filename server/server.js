// server.js
import express from 'express';
import cors from 'cors';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());

// JWT Secret (in a real app, this would be in environment variables)
const JWT_SECRET = 'your_jwt_secret';

// In-memory data store (in a real app, this would be a database)
let users = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    password: 'password123', // In a real app, this would be hashed
    timezone: 'America/New_York',
    preferences: {
      theme: 'light',
      notifications: true,
      soundEffects: true,
      voiceCommands: true,
      language: 'en'
    }
  }
];

let longTermGoals = [
  {
    id: '1',
    userId: '1',
    title: 'Learn Full Stack Development',
    description: 'Master both frontend and backend technologies',
    targetDate: '2025-12-31',
    progress: 45,
    completed: false,
    milestones: [
      {
        id: '101',
        title: 'Learn HTML/CSS/JavaScript',
        targetDate: '2025-03-01',
        completed: true
      },
      {
        id: '102',
        title: 'Master React',
        targetDate: '2025-06-01',
        completed: true
      },
      {
        id: '103',
        title: 'Learn Node.js and Express',
        targetDate: '2025-09-01',
        completed: false
      },
      {
        id: '104',
        title: 'Build a full stack project',
        targetDate: '2025-12-01',
        completed: false
      }
    ]
  },
  {
    id: '2',
    userId: '1',
    title: 'Get In Shape',
    description: 'Improve fitness and health',
    targetDate: '2025-12-31',
    progress: 30,
    completed: false,
    milestones: [
      {
        id: '201',
        title: 'Start regular exercise routine',
        targetDate: '2025-02-01',
        completed: true
      },
      {
        id: '202',
        title: 'Run 5km without stopping',
        targetDate: '2025-05-01',
        completed: false
      },
      {
        id: '203',
        title: 'Complete a half marathon',
        targetDate: '2025-10-01',
        completed: false
      }
    ]
  }
];

let shortTermGoals = [
  {
    id: '1',
    userId: '1',
    parentGoalId: '1',
    title: 'Complete React Course',
    description: 'Finish the online React course',
    timeframe: 'weekly',
    endDate: '2025-05-14',
    progress: 75,
    completed: false
  },
  {
    id: '2',
    userId: '1',
    parentGoalId: '1',
    title: 'Build a Todo App',
    description: 'Create a simple todo app with React',
    timeframe: 'daily',
    endDate: '2025-05-07',
    progress: 50,
    completed: false
  },
  {
    id: '3',
    userId: '1',
    parentGoalId: '2',
    title: 'Exercise 3 times this week',
    description: 'Go to gym or run outside',
    timeframe: 'weekly',
    endDate: '2025-05-14',
    progress: 33,
    completed: false
  },
  {
    id: '4',
    userId: '1',
    parentGoalId: '2',
    title: 'Morning Jog',
    description: 'Jog for 30 minutes',
    timeframe: 'daily',
    endDate: '2025-05-07',
    progress: 0,
    completed: false
  },
  {
    id: '5',
    userId: '1',
    parentGoalId: null,
    title: 'Read a Book',
    description: 'Finish reading "Atomic Habits"',
    timeframe: 'monthly',
    endDate: '2025-05-31',
    progress: 60,
    completed: false
  }
];

let tasks = [
  {
    id: '1',
    userId: '1',
    title: 'Complete chapter 5 of React course',
    description: 'Focus on React hooks',
    completed: false,
    estimatedTime: 45,
    dueDate: '2025-05-07',
    priority: 'high',
    relatedGoalId: '1'
  },
  {
    id: '2',
    userId: '1',
    title: 'Create component structure for todo app',
    description: 'Plan out the components and state management',
    completed: true,
    estimatedTime: 30,
    dueDate: '2025-05-06',
    priority: 'medium',
    relatedGoalId: '2'
  },
  {
    id: '3',
    userId: '1',
    title: 'Morning jog in the park',
    description: '30 minutes at moderate pace',
    completed: false,
    estimatedTime: 30,
    dueDate: '2025-05-07',
    priority: 'medium',
    relatedGoalId: '4',
    daily: true
  },
  {
    id: '4',
    userId: '1',
    title: 'Grocery shopping',
    description: 'Buy healthy foods for the week',
    completed: false,
    estimatedTime: 60,
    dueDate: '2025-05-07',
    priority: 'low',
    relatedGoalId: null
  },
  {
    id: '5',
    userId: '1',
    title: 'Read 20 pages of Atomic Habits',
    description: '',
    completed: false,
    estimatedTime: 30,
    dueDate: '2025-05-07',
    priority: 'low',
    relatedGoalId: '5',
    daily: true
  }
];

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
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const user = users.find(user => user.email === email && user.password === password);
  
  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }
  
  const token = generateToken(user.id);
  
  // Don't send password in response
  const { password: _, ...userWithoutPassword } = user;
  
  res.json({ 
    token, 
    user: userWithoutPassword
  });
});

app.post('/api/auth/register', (req, res) => {
  const { firstName, lastName, email, password } = req.body;
  
  if (!firstName || !lastName || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  const userExists = users.some(user => user.email === email);
  
  if (userExists) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }
  
  const newUser = {
    id: uuidv4(),
    firstName,
    lastName,
    email,
    password,
    timezone: 'America/New_York',
    preferences: {
      theme: 'light',
      notifications: true,
      soundEffects: true,
      voiceCommands: true,
      language: 'en'
    }
  };
  
  users.push(newUser);
  
  const token = generateToken(newUser.id);
  
  // Don't send password in response
  const { password: _, ...userWithoutPassword } = newUser;
  
  res.status(201).json({ 
    token, 
    user: userWithoutPassword
  });
});

app.put('/api/auth/profile', verifyToken, (req, res) => {
  const { firstName, lastName, email, timezone } = req.body;
  
  const userIndex = users.findIndex(user => user.id === req.userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  // Update user information
  users[userIndex] = {
    ...users[userIndex],
    firstName: firstName || users[userIndex].firstName,
    lastName: lastName || users[userIndex].lastName,
    email: email || users[userIndex].email,
    timezone: timezone || users[userIndex].timezone
  };
  
  // Don't send password in response
  const { password: _, ...userWithoutPassword } = users[userIndex];
  
  res.json({ 
    user: userWithoutPassword
  });
});

app.post('/api/auth/change-password', verifyToken, (req, res) => {
  const { currentPassword, newPassword } = req.body;
  
  const userIndex = users.findIndex(user => user.id === req.userId);
  
  if (userIndex === -1) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  if (users[userIndex].password !== currentPassword) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }
  
  // Update password
  users[userIndex].password = newPassword;
  
  res.json({ message: 'Password updated successfully' });
});

// Goals Routes
app.get('/api/goals', verifyToken, (req, res) => {
  const userLongTermGoals = longTermGoals.filter(goal => goal.userId === req.userId);
  const userShortTermGoals = shortTermGoals.filter(goal => goal.userId === req.userId);
  
  res.json({
    longTermGoals: userLongTermGoals,
    shortTermGoals: userShortTermGoals
  });
});

app.post('/api/goals/long-term', verifyToken, (req, res) => {
  const { title, description, targetDate, milestones } = req.body;
  
  if (!title || !targetDate) {
    return res.status(400).json({ message: 'Title and target date are required' });
  }
  
  const newGoal = {
    id: uuidv4(),
    userId: req.userId,
    title,
    description: description || '',
    targetDate,
    progress: 0,
    completed: false,
    milestones: milestones || []
  };
  
  // Add IDs to milestones
  if (newGoal.milestones.length > 0) {
    newGoal.milestones = newGoal.milestones.map(milestone => ({
      ...milestone,
      id: uuidv4()
    }));
  }
  
  longTermGoals.push(newGoal);
  
  res.status(201).json({ goal: newGoal });
});

app.post('/api/goals/short-term', verifyToken, (req, res) => {
  const { title, description, timeframe, endDate, parentGoalId } = req.body;
  
  if (!title || !timeframe || !endDate) {
    return res.status(400).json({ message: 'Title, timeframe, and end date are required' });
  }
  
  const newGoal = {
    id: uuidv4(),
    userId: req.userId,
    title,
    description: description || '',
    timeframe,
    endDate,
    parentGoalId: parentGoalId || null,
    progress: 0,
    completed: false
  };
  
  shortTermGoals.push(newGoal);
  
  res.status(201).json({ goal: newGoal });
});

app.put('/api/goals/long-term/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { title, description, targetDate, progress, completed, milestones } = req.body;
  
  const goalIndex = longTermGoals.findIndex(goal => goal.id === id && goal.userId === req.userId);
  
  if (goalIndex === -1) {
    return res.status(404).json({ message: 'Goal not found' });
  }
  
  // Update goal
  longTermGoals[goalIndex] = {
    ...longTermGoals[goalIndex],
    title: title || longTermGoals[goalIndex].title,
    description: description !== undefined ? description : longTermGoals[goalIndex].description,
    targetDate: targetDate || longTermGoals[goalIndex].targetDate,
    progress: progress !== undefined ? progress : longTermGoals[goalIndex].progress,
    completed: completed !== undefined ? completed : longTermGoals[goalIndex].completed,
    milestones: milestones || longTermGoals[goalIndex].milestones
  };
  
  res.json({ goal: longTermGoals[goalIndex] });
});

app.put('/api/goals/short-term/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { title, description, timeframe, endDate, parentGoalId, progress, completed } = req.body;
  
  const goalIndex = shortTermGoals.findIndex(goal => goal.id === id && goal.userId === req.userId);
  
  if (goalIndex === -1) {
    return res.status(404).json({ message: 'Goal not found' });
  }
  
  // Update goal
  shortTermGoals[goalIndex] = {
    ...shortTermGoals[goalIndex],
    title: title || shortTermGoals[goalIndex].title,
    description: description !== undefined ? description : shortTermGoals[goalIndex].description,
    timeframe: timeframe || shortTermGoals[goalIndex].timeframe,
    endDate: endDate || shortTermGoals[goalIndex].endDate,
    parentGoalId: parentGoalId !== undefined ? parentGoalId : shortTermGoals[goalIndex].parentGoalId,
    progress: progress !== undefined ? progress : shortTermGoals[goalIndex].progress,
    completed: completed !== undefined ? completed : shortTermGoals[goalIndex].completed
  };
  
  res.json({ goal: shortTermGoals[goalIndex] });
});

app.delete('/api/goals/long-term/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  
  const goalIndex = longTermGoals.findIndex(goal => goal.id === id && goal.userId === req.userId);
  
  if (goalIndex === -1) {
    return res.status(404).json({ message: 'Goal not found' });
  }
  
  // Remove goal
  longTermGoals.splice(goalIndex, 1);
  
  // Also remove any short-term goals associated with this long-term goal
  shortTermGoals = shortTermGoals.filter(goal => goal.parentGoalId !== id);
  
  res.json({ message: 'Goal deleted successfully' });
});

app.delete('/api/goals/short-term/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  
  const goalIndex = shortTermGoals.findIndex(goal => goal.id === id && goal.userId === req.userId);
  
  if (goalIndex === -1) {
    return res.status(404).json({ message: 'Goal not found' });
  }
  
  // Remove goal
  shortTermGoals.splice(goalIndex, 1);
  
  res.json({ message: 'Goal deleted successfully' });
});

// Milestone Routes
app.post('/api/goals/long-term/:goalId/milestones', verifyToken, (req, res) => {
  const { goalId } = req.params;
  const { title, targetDate } = req.body;
  
  const goalIndex = longTermGoals.findIndex(goal => goal.id === goalId && goal.userId === req.userId);
  
  if (goalIndex === -1) {
    return res.status(404).json({ message: 'Goal not found' });
  }
  
  if (!title || !targetDate) {
    return res.status(400).json({ message: 'Title and target date are required' });
  }
  
  const newMilestone = {
    id: uuidv4(),
    title,
    targetDate,
    completed: false
  };
  
  longTermGoals[goalIndex].milestones.push(newMilestone);
  
  res.status(201).json({ goal: longTermGoals[goalIndex] });
});

app.put('/api/goals/long-term/:goalId/milestones/:milestoneId', verifyToken, (req, res) => {
  const { goalId, milestoneId } = req.params;
  const { title, targetDate, completed } = req.body;
  
  const goalIndex = longTermGoals.findIndex(goal => goal.id === goalId && goal.userId === req.userId);
  
  if (goalIndex === -1) {
    return res.status(404).json({ message: 'Goal not found' });
  }
  
  const milestoneIndex = longTermGoals[goalIndex].milestones.findIndex(milestone => milestone.id === milestoneId);
  
  if (milestoneIndex === -1) {
    return res.status(404).json({ message: 'Milestone not found' });
  }
  
  // Update milestone
  longTermGoals[goalIndex].milestones[milestoneIndex] = {
    ...longTermGoals[goalIndex].milestones[milestoneIndex],
    title: title || longTermGoals[goalIndex].milestones[milestoneIndex].title,
    targetDate: targetDate || longTermGoals[goalIndex].milestones[milestoneIndex].targetDate,
    completed: completed !== undefined ? completed : longTermGoals[goalIndex].milestones[milestoneIndex].completed
  };
  
  // Calculate goal progress based on completed milestones
  const totalMilestones = longTermGoals[goalIndex].milestones.length;
  const completedMilestones = longTermGoals[goalIndex].milestones.filter(m => m.completed).length;
  
  if (totalMilestones > 0) {
    longTermGoals[goalIndex].progress = Math.round((completedMilestones / totalMilestones) * 100);
    longTermGoals[goalIndex].completed = longTermGoals[goalIndex].progress === 100;
  }
  
  res.json({ goal: longTermGoals[goalIndex] });
});

app.delete('/api/goals/long-term/:goalId/milestones/:milestoneId', verifyToken, (req, res) => {
  const { goalId, milestoneId } = req.params;
  
  const goalIndex = longTermGoals.findIndex(goal => goal.id === goalId && goal.userId === req.userId);
  
  if (goalIndex === -1) {
    return res.status(404).json({ message: 'Goal not found' });
  }
  
  const milestoneIndex = longTermGoals[goalIndex].milestones.findIndex(milestone => milestone.id === milestoneId);
  
  if (milestoneIndex === -1) {
    return res.status(404).json({ message: 'Milestone not found' });
  }
  
  // Remove milestone
  longTermGoals[goalIndex].milestones.splice(milestoneIndex, 1);
  
  // Recalculate goal progress
  const totalMilestones = longTermGoals[goalIndex].milestones.length;
  const completedMilestones = longTermGoals[goalIndex].milestones.filter(m => m.completed).length;
  
  if (totalMilestones > 0) {
    longTermGoals[goalIndex].progress = Math.round((completedMilestones / totalMilestones) * 100);
    longTermGoals[goalIndex].completed = longTermGoals[goalIndex].progress === 100;
  } else {
    longTermGoals[goalIndex].progress = 0;
    longTermGoals[goalIndex].completed = false;
  }
  
  res.json({ goal: longTermGoals[goalIndex] });
});

// Tasks Routes
app.get('/api/tasks', verifyToken, (req, res) => {
  const userTasks = tasks.filter(task => task.userId === req.userId);
  
  res.json({ tasks: userTasks });
});

app.post('/api/tasks', verifyToken, (req, res) => {
  const { title, description, estimatedTime, dueDate, priority, relatedGoalId, daily } = req.body;
  
  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }
  
  const newTask = {
    id: uuidv4(),
    userId: req.userId,
    title,
    description: description || '',
    completed: false,
    estimatedTime: estimatedTime || null,
    dueDate: dueDate || null,
    priority: priority || 'medium',
    relatedGoalId: relatedGoalId || null,
    daily: daily || false
  };
  
  tasks.push(newTask);
  
  res.status(201).json({ task: newTask });
});

app.put('/api/tasks/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  const { title, description, completed, estimatedTime, dueDate, priority, relatedGoalId, daily } = req.body;
  
  const taskIndex = tasks.findIndex(task => task.id === id && task.userId === req.userId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  // Update task
  tasks[taskIndex] = {
    ...tasks[taskIndex],
    title: title || tasks[taskIndex].title,
    description: description !== undefined ? description : tasks[taskIndex].description,
    completed: completed !== undefined ? completed : tasks[taskIndex].completed,
    estimatedTime: estimatedTime !== undefined ? estimatedTime : tasks[taskIndex].estimatedTime,
    dueDate: dueDate !== undefined ? dueDate : tasks[taskIndex].dueDate,
    priority: priority || tasks[taskIndex].priority,
    relatedGoalId: relatedGoalId !== undefined ? relatedGoalId : tasks[taskIndex].relatedGoalId,
    daily: daily !== undefined ? daily : tasks[taskIndex].daily
  };
  
  res.json({ task: tasks[taskIndex] });
});

app.delete('/api/tasks/:id', verifyToken, (req, res) => {
  const { id } = req.params;
  
  const taskIndex = tasks.findIndex(task => task.id === id && task.userId === req.userId);
  
  if (taskIndex === -1) {
    return res.status(404).json({ message: 'Task not found' });
  }
  
  // Remove task
  tasks.splice(taskIndex, 1);
  
  res.json({ message: 'Task deleted successfully' });
});

app.put('/api/tasks/batch', verifyToken, (req, res) => {
  const { tasks: taskUpdates } = req.body;
  
  if (!taskUpdates || !Array.isArray(taskUpdates)) {
    return res.status(400).json({ message: 'Tasks must be an array' });
  }
  
  const updatedTasks = [];
  
  for (const update of taskUpdates) {
    if (!update.id) {
      continue;
    }
    
    const taskIndex = tasks.findIndex(task => task.id === update.id && task.userId === req.userId);
    
    if (taskIndex !== -1) {
      // Update task
      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...update
      };
      
      updatedTasks.push(tasks[taskIndex]);
    }
  }
  
  res.json({ tasks: updatedTasks });
});

// Voice/AI Routes
app.post('/api/voice/process', verifyToken, (req, res) => {
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
});

app.post('/api/ai/suggestions', verifyToken, (req, res) => {
  // This is a mock implementation
  // In a real app, this would connect to an AI service
  
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
});

app.post('/api/ai/generate/short-term-goals', verifyToken, (req, res) => {
  const { longTermGoalId } = req.body;
  
  const longTermGoal = longTermGoals.find(
    goal => goal.id === longTermGoalId && goal.userId === req.userId
  );
  
  if (!longTermGoal) {
    return res.status(404).json({ message: 'Long-term goal not found' });
  }
  
  // This is a mock implementation
  // In a real app, this would use an AI service to generate personalized goals
  
  const now = new Date();
  const oneDay = new Date(now);
  oneDay.setDate(now.getDate() + 1);
  
  const oneWeek = new Date(now);
  oneWeek.setDate(now.getDate() + 7);
  
  const oneMonth = new Date(now);
  oneMonth.setMonth(now.getMonth() + 1);
  
  const generatedGoals = [
    {
      id: uuidv4(),
      userId: req.userId,
      parentGoalId: longTermGoalId,
      title: `Daily Progress: ${longTermGoal.title}`,
      description: `Take one small step toward ${longTermGoal.title}`,
      timeframe: 'daily',
      endDate: oneDay.toISOString().split('T')[0],
      progress: 0,
      completed: false
    },
    {
      id: uuidv4(),
      userId: req.userId,
      parentGoalId: longTermGoalId,
      title: `Weekly Plan: ${longTermGoal.title}`,
      description: `Make measurable progress toward ${longTermGoal.title} this week`,
      timeframe: 'weekly',
      endDate: oneWeek.toISOString().split('T')[0],
      progress: 0,
      completed: false
    },
    {
      id: uuidv4(),
      userId: req.userId,
      parentGoalId: longTermGoalId,
      title: `Monthly Milestone: ${longTermGoal.title}`,
      description: `Complete a significant portion of work needed for ${longTermGoal.title}`,
      timeframe: 'monthly',
      endDate: oneMonth.toISOString().split('T')[0],
      progress: 0,
      completed: false
    }
  ];
  
  // Add to our in-memory database
  shortTermGoals = [...shortTermGoals, ...generatedGoals];
  
  res.json({ goals: generatedGoals });
});

app.post('/api/ai/generate/tasks', verifyToken, (req, res) => {
  const { goalId, goalType } = req.body;
  
  let goal;
  
  if (goalType === 'long-term') {
    goal = longTermGoals.find(g => g.id === goalId && g.userId === req.userId);
  } else {
    goal = shortTermGoals.find(g => g.id === goalId && g.userId === req.userId);
  }
  
  if (!goal) {
    return res.status(404).json({ message: 'Goal not found' });
  }
  
  // This is a mock implementation
  // In a real app, this would use an AI service to generate personalized tasks
  
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  
  const threeDays = new Date(now);
  threeDays.setDate(now.getDate() + 3);
  
  const generatedTasks = [
    {
      id: uuidv4(),
      userId: req.userId,
      title: `Research: ${goal.title}`,
      description: `Spend 30 minutes researching best approaches for ${goal.title}`,
      completed: false,
      estimatedTime: 30,
      dueDate: now.toISOString().split('T')[0],
      priority: 'high',
      relatedGoalId: goalId
    },
    {
      id: uuidv4(),
      userId: req.userId,
      title: `Plan: ${goal.title}`,
      description: `Create a detailed action plan for ${goal.title}`,
      completed: false,
      estimatedTime: 45,
      dueDate: tomorrow.toISOString().split('T')[0],
      priority: 'medium',
      relatedGoalId: goalId
    },
    {
      id: uuidv4(),
      userId: req.userId,
      title: `First action for ${goal.title}`,
      description: `Complete the first concrete action for ${goal.title}`,
      completed: false,
      estimatedTime: 60,
      dueDate: threeDays.toISOString().split('T')[0],
      priority: 'medium',
      relatedGoalId: goalId
    }
  ];
  
  // Add to our in-memory database
  tasks = [...tasks, ...generatedTasks];
  
  res.json({ tasks: generatedTasks });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/dist')));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/dist', 'index.html'));
  });
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});