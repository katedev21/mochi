// server/models/LongTermGoal.js
import mongoose from 'mongoose';

const MilestoneSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Milestone title is required'],
    trim: true
  },
  targetDate: {
    type: Date,
    required: [true, 'Target date is required']
  },
  completed: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const LongTermGoalSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  targetDate: {
    type: Date,
    required: [true, 'Target date is required']
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
  milestones: [MilestoneSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for shortTermGoals associated with this long-term goal
LongTermGoalSchema.virtual('shortTermGoals', {
  ref: 'ShortTermGoal',
  localField: '_id',
  foreignField: 'parentGoal'
});

const LongTermGoal = mongoose.model('LongTermGoal', LongTermGoalSchema);

export default LongTermGoal;