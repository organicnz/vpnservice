const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  planId: {
    type: String,
    required: true
  },
  planName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'expired', 'canceled', 'suspended'],
    default: 'active'
  },
  trafficLimit: {
    type: Number, // in GB
    required: true
  },
  usedTraffic: {
    type: Number, // in GB
    default: 0
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  autoRenew: {
    type: Boolean,
    default: false
  },
  paymentId: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastCheckedTraffic: {
    type: Date
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Virtual for remaining traffic
subscriptionSchema.virtual('remainingTraffic').get(function() {
  return Math.max(0, this.trafficLimit - this.usedTraffic);
});

// Virtual for remaining days
subscriptionSchema.virtual('remainingDays').get(function() {
  const now = new Date();
  const endDate = new Date(this.endDate);
  
  // Calculate difference in days
  const diff = endDate - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  return Math.max(0, days);
});

// Method to check if subscription is active
subscriptionSchema.methods.isActive = function() {
  const now = new Date();
  return (
    this.status === 'active' &&
    new Date(this.endDate) > now &&
    (this.usedTraffic < this.trafficLimit || this.trafficLimit === 0)
  );
};

// Method to check if subscription is about to expire
subscriptionSchema.methods.isAboutToExpire = function(daysThreshold = 3) {
  return this.isActive() && this.remainingDays <= daysThreshold;
};

// Method to check if traffic limit is almost reached
subscriptionSchema.methods.isTrafficAlmostReached = function(percentThreshold = 90) {
  if (this.trafficLimit === 0) return false; // Unlimited traffic
  
  const usedPercent = (this.usedTraffic / this.trafficLimit) * 100;
  return usedPercent >= percentThreshold;
};

const Subscription = mongoose.model('Subscription', subscriptionSchema);

module.exports = Subscription; 