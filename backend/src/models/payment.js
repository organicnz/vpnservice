const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  paymentId: {
    type: String,
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'RUB'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  method: {
    type: String,
    enum: ['card', 'sbp', 'qiwi', 'yoomoney', 'crypto', 'paypal', 'other'],
    default: 'other'
  },
  planId: {
    type: String,
    required: true
  },
  planName: {
    type: String
  },
  paymentDate: {
    type: Date
  },
  gatewayResponse: {
    type: Object
  },
  invoiceId: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Method to mark payment as completed
paymentSchema.methods.markAsCompleted = async function(gatewayResponse) {
  this.status = 'completed';
  this.paymentDate = new Date();
  this.gatewayResponse = gatewayResponse || {};
  
  return this.save();
};

// Method to mark payment as failed
paymentSchema.methods.markAsFailed = async function(gatewayResponse) {
  this.status = 'failed';
  this.gatewayResponse = gatewayResponse || {};
  
  return this.save();
};

// Method to generate invoice
paymentSchema.methods.generateInvoice = async function() {
  const invoiceId = `INV-${Date.now()}-${this._id.toString().substr(-6)}`;
  this.invoiceId = invoiceId;
  
  await this.save();
  
  return invoiceId;
};

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment; 