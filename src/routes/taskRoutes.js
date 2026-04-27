const express = require('express');
const router = express.Router();
const { getDailyTasks, completeTask } = require('../controllers/taskController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/').get(protect, getDailyTasks);
router.route('/:taskId/complete').put(protect, completeTask);

module.exports = router;
