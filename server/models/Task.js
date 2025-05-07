// server/models/Task.js
import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  estimatedTime: {
    type: Number,
    default: null
  },
  dueDate: {
    type: Date,
    default: null
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  relatedGoal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ShortTermGoal',
    default: null
  },
  daily: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Task = mongoose.model('Task', TaskSchema);

export default Task;