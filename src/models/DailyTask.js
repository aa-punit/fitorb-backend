const mongoose = require('mongoose');

const dailyTaskSchema = mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  taskType: { 
    type: String, 
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Morning Workout', 'Evening Workout', 'Mental Activity'],
    required: true
  },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }
}, {
  timestamps: true
});

const DailyTask = mongoose.model('DailyTask', dailyTaskSchema);
module.exports = DailyTask;
