const express = require('express');
const router  = express.Router();
const {
  registerUser, authUser, getUserProfile, updateUserProfile,
  getSettings, updateSettings, changePassword, deleteAccount,
} = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login',    authUser);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

router.route('/settings')
  .get(protect, getSettings)
  .put(protect, updateSettings);

router.put('/change-password', protect, changePassword);
router.delete('/account',      protect, deleteAccount);

module.exports = router;
