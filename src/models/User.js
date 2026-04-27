const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  
  // Onboarding stats
  height: { type: Number }, // in cm
  weight: { type: Number }, // in kg
  age: { type: Number },
  gender: { type: String },
  goal: { type: String, enum: ['Weight Loss', 'Gain', 'Maintain'] },
  foodPreference: { type: String },
  activityLevel: { type: String },
  profilePicture: { type: String, default: '' },

  // User settings / preferences
  settings: {
    notifications: {
      workoutReminder:   { type: Boolean, default: true  },
      mealReminder:      { type: Boolean, default: true  },
      weeklyReport:      { type: Boolean, default: false },
      mentalWellness:    { type: Boolean, default: true  },
      pushNotifications: { type: Boolean, default: true  },
      emailDigest:       { type: Boolean, default: false },
    },
    appearance: {
      theme:       { type: String, default: 'dark'   },
      accentColor: { type: String, default: 'indigo' },
      compactMode: { type: Boolean, default: false   },
      animations:  { type: Boolean, default: true    },
    },
    units: {
      weight:   { type: String, default: 'kg' },
      height:   { type: String, default: 'cm' },
      distance: { type: String, default: 'km' },
    },
    privacy: {
      shareProgress: { type: Boolean, default: false },
      analyticsOpt:  { type: Boolean, default: true  },
      publicProfile: { type: Boolean, default: false },
    },
  },

  // Calculated
  bmi: { type: Number },
  category: { type: String, enum: ['Malnutrition', 'Fit', 'Obese'] }
}, {
  timestamps: true
});

userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
module.exports = User;
