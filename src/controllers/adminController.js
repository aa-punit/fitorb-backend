const User = require('../models/User');
const DailyTask = require('../models/DailyTask');
const MentalScore = require('../models/MentalScore');

const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalTasks = await DailyTask.countDocuments();
    const completedTasks = await DailyTask.countDocuments({ isCompleted: true });
    
    const taskCompletionRate = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);
    
    const scores = await MentalScore.find();
    const avgScore = scores.length === 0 ? 0 : Math.round(scores.reduce((acc, curr) => acc + curr.score, 0) / scores.length);

    res.json({
      totalUsers,
      taskCompletionRate,
      avgScore
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: 'user' }).select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await DailyTask.deleteMany({ userId: req.params.id });
    await MentalScore.deleteMany({ userId: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDashboardStats, getAllUsers, deleteUser };
