const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  lastLoginAt: {
    type: Date
  },
  vpnUsername: {
    type: String
  },
  vpnPassword: {
    type: String
  }
}, {
  timestamps: true
});

// Hash the password before saving
userSchema.pre('save', async function(next) {
  const user = this;
  if (user.password && user.isModified('password')) {
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(user.password, salt);
  }
  next();
});

// Method to compare passwords
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Method to generate JWT token
userSchema.methods.generateAuthToken = function() {
  const jwt = require('jsonwebtoken');
  
  const payload = {
    id: this._id,
    username: this.username,
    email: this.email,
    role: this.role
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Virtuals for active subscriptions
userSchema.virtual('activeSubscriptions', {
  ref: 'Subscription',
  localField: '_id',
  foreignField: 'userId',
  match: {
    status: 'active',
    endDate: { $gt: new Date() }
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User; 