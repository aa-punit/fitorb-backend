const DailyTask = require('../models/DailyTask');

const getTodayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const getDailyTasks = async (req, res) => {
  try {
    const today = getTodayStr();
    let tasks = await DailyTask.find({ userId: req.user._id, date: today });
    
    if (tasks.length === 0) {
      const defaultTasks = [
        { userId: req.user._id, date: today, taskType: 'Breakfast' },
        { userId: req.user._id, date: today, taskType: 'Morning Workout' },
        { userId: req.user._id, date: today, taskType: 'Lunch' },
        { userId: req.user._id, date: today, taskType: 'Mental Activity' },
        { userId: req.user._id, date: today, taskType: 'Evening Workout' },
        { userId: req.user._id, date: today, taskType: 'Dinner' },
      ];
      tasks = await DailyTask.insertMany(defaultTasks);
    }
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const completeTask = async (req, res) => {
  try {
    const { taskId } = req.params;
    const task = await DailyTask.findOne({ _id: taskId, userId: req.user._id });
    
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.isCompleted) return res.status(400).json({ message: 'Task already completed' });

    // Time-based Logic
    const currentHour = new Date().getHours();
    
    if (task.taskType === 'Breakfast' || task.taskType === 'Morning Workout') {
      if (currentHour >= 12) return res.status(400).json({ message: 'Too late to complete morning tasks' });
    } else if (task.taskType === 'Lunch') {
      if (currentHour < 11 || currentHour >= 16) return res.status(400).json({ message: 'Lunch is only between 11 AM and 4 PM' });
    } else if (task.taskType === 'Dinner' || task.taskType === 'Evening Workout') {
      if (currentHour < 16) return res.status(400).json({ message: 'Too early to complete evening tasks' });
    }
    
    task.isCompleted = true;
    task.completedAt = new Date();
    await task.save();
    
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDailyTasks, completeTask };
