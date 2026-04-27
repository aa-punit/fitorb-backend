const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
  try {
    const { name, email, password, height, weight, age, gender, goal, foodPreference, activityLevel } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Calculate BMI if height and weight are provided
    let bmi = null;
    let category = null;
    if (height && weight) {
      const heightInMeters = height / 100;
      bmi = weight / (heightInMeters * heightInMeters);
      if (bmi < 18.5) category = 'Malnutrition';
      else if (bmi < 25) category = 'Fit';
      else category = 'Obese';
    }

    const user = await User.create({
      name, email, password, height, weight, age, gender, goal, foodPreference, activityLevel, bmi, category
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bmi: user.bmi,
        category: user.category,
        height: user.height,
        weight: user.weight,
        age: user.age,
        gender: user.gender,
        goal: user.goal,
        activityLevel: user.activityLevel,
        foodPreference: user.foodPreference,
        profilePicture: user.profilePicture || '',
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const authUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bmi: user.bmi,
        category: user.category,
        height: user.height,
        weight: user.weight,
        age: user.age,
        gender: user.gender,
        goal: user.goal,
        activityLevel: user.activityLevel,
        foodPreference: user.foodPreference,
        profilePicture: user.profilePicture || '',
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bmi: user.bmi,
      category: user.category,
      goal: user.goal,
      height: user.height,
      weight: user.weight,
      age: user.age,
      gender: user.gender,
      activityLevel: user.activityLevel,
      foodPreference: user.foodPreference,
      profilePicture: user.profilePicture || ''
    });
  } else {
    res.status(404).json({ message: 'User not found' });
  }
};

const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      // Only update email if provided and different
      if (req.body.email && req.body.email !== user.email) {
        const emailExists = await User.findOne({ email: req.body.email });
        if (emailExists) {
          return res.status(400).json({ message: 'Email already in use by another account.' });
        }
        user.email = req.body.email;
      }
      if (req.body.height !== undefined && req.body.height !== '') user.height = Number(req.body.height);
      if (req.body.weight !== undefined && req.body.weight !== '') user.weight = Number(req.body.weight);
      if (req.body.age    !== undefined && req.body.age    !== '') user.age    = Number(req.body.age);
      if (req.body.gender)        user.gender        = req.body.gender;
      if (req.body.goal)          user.goal          = req.body.goal;
      if (req.body.activityLevel) user.activityLevel = req.body.activityLevel;
      if (req.body.foodPreference)user.foodPreference= req.body.foodPreference;
      // Save profile picture (base64 string)
      if (req.body.profilePicture !== undefined) user.profilePicture = req.body.profilePicture;
      // Update password if provided
      if (req.body.password) user.password = req.body.password;

      // Recalculate BMI
      if (user.height && user.weight) {
        const heightInMeters = user.height / 100;
        user.bmi = user.weight / (heightInMeters * heightInMeters);
        if (user.bmi < 18.5) user.category = 'Malnutrition';
        else if (user.bmi < 25) user.category = 'Fit';
        else user.category = 'Obese';
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        bmi: updatedUser.bmi,
        category: updatedUser.category,
        goal: updatedUser.goal,
        height: updatedUser.height,
        weight: updatedUser.weight,
        age: updatedUser.age,
        gender: updatedUser.gender,
        activityLevel: updatedUser.activityLevel,
        foodPreference: updatedUser.foodPreference,
        profilePicture: updatedUser.profilePicture || '',
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    res.status(500).json({ message: error.message || 'Server Error' });
  }
};

/* ── GET /api/auth/settings ── */
const getSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('settings');
    if (!user) return res.status(404).json({ message: 'User not found' });
    // Return with defaults merged so frontend always gets a full object
    const defaults = {
      notifications: {
        workoutReminder: true, mealReminder: true, weeklyReport: false,
        mentalWellness: true, pushNotifications: true, emailDigest: false,
      },
      appearance: { theme: 'dark', accentColor: 'indigo', compactMode: false, animations: true },
      units:  { weight: 'kg', height: 'cm', distance: 'km' },
      privacy: { shareProgress: false, analyticsOpt: true, publicProfile: false },
    };
    const saved = user.settings ? user.settings.toObject() : {};
    const merged = {
      notifications: { ...defaults.notifications, ...(saved.notifications || {}) },
      appearance:    { ...defaults.appearance,    ...(saved.appearance    || {}) },
      units:         { ...defaults.units,         ...(saved.units         || {}) },
      privacy:       { ...defaults.privacy,       ...(saved.privacy       || {}) },
    };
    res.json(merged);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── PUT /api/auth/settings ── */
const updateSettings = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const { notifications, appearance, units, privacy } = req.body;
    if (!user.settings) user.settings = {};
    if (notifications) user.settings.notifications = { ...user.settings.notifications, ...notifications };
    if (appearance)    user.settings.appearance    = { ...user.settings.appearance,    ...appearance };
    if (units)         user.settings.units         = { ...user.settings.units,         ...units };
    if (privacy)       user.settings.privacy       = { ...user.settings.privacy,       ...privacy };
    user.markModified('settings');

    await user.save();
    res.json({ message: 'Settings saved successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── PUT /api/auth/change-password ── */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new password are required.' });
    }
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect.' });

    user.password = newPassword;   // pre-save hook will hash it
    await user.save();
    res.json({ message: 'Password changed successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── DELETE /api/auth/account ── */
const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    await user.deleteOne();
    res.json({ message: 'Account deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  registerUser, authUser, getUserProfile, updateUserProfile,
  getSettings, updateSettings, changePassword, deleteAccount,
};
