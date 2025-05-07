// server/models/ShortTermGoal.js
import mongoose from 'mongoose';

const ShortTermGoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentGoal: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LongTermGoal',
    default: null
  },
  title: {
    type: String,
    required: [true, 'Goal title is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  timeframe: {
    type: String,
    required: [true, 'Timeframe is required'],
    enum: ['daily', 'weekly', 'monthly', 'quarterly']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for tasks associated with this short-term goal
ShortTermGoalSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'relatedGoal'
});

const ShortTermGoal = mongoose.model('ShortTermGoal', ShortTermGoalSchema);

export default ShortTermGoal;