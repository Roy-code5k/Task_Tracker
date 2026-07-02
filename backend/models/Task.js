import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true,
    minlength: [3, 'Task title must be at least 3 characters long'],
    maxlength: [80, 'Task title cannot exceed 80 characters']
  },
  description: {
    type: String,
    trim: true,
    default: '',
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: {
      values: ['todo', 'in-progress', 'done'],
      message: 'Status must be todo, in-progress, or done'
    },
    default: 'todo'
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: 'Priority must be low, medium, or high'
    },
    default: 'medium'
  },
  category: {
    type: String,
    trim: true,
    default: '',
    maxlength: [30, 'Category cannot exceed 30 characters']
  },
  tags: {
    type: [String],
    default: []
  },
  dueDate: {
  type: Date,
  default: null,
  validate: {
    validator(value) {
      if (!value) return true;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return value >= today;
    },
    message: "Due date cannot be in the past"
  }
},
  estimatedTime: {
    type: Number,
    default: 0,
    min: [0, 'Estimated time cannot be negative']
  },
  // Placeholder field for future multi-user migration
  userId: {
    type: String,
    default: null
  }
}, {
  timestamps: true
});

const Task = mongoose.model('Task', taskSchema);

export default Task;
