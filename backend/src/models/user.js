// Conditional import of mongoose based on database type
let mongoose;
try {
  mongoose = require('mongoose');
} catch (error) {
  console.warn('Mongoose not available, using Supabase instead');
}

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// If mongoose is available, define the schema
let User;

if (mongoose) {
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
    const payload = {
      id: this._id,
      username: this.username,
      email: this.email,
      role: this.role
    };
    
    return jwt.sign(payload, process.env.JWT_SECRET || 'defaultsecret', { expiresIn: '7d' });
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

  User = mongoose.model('User', userSchema);
} else {
  // Supabase implementation
  User = {
    // Create a mock User class for Supabase that mimics Mongoose methods
    findOne: async function(query) {
      const { supabase } = global;
      if (!supabase) throw new Error('Supabase client not initialized');
      
      let supabaseQuery = supabase.from('users').select('*');
      
      if (query.email) {
        supabaseQuery = supabaseQuery.eq('email', query.email);
      } else if (query.telegramId) {
        supabaseQuery = supabaseQuery.eq('telegram_id', query.telegramId);
      }
      
      const { data, error } = await supabaseQuery.single();
      
      if (error) return null;
      
      // Transform to match mongoose model
      return {
        ...data,
        _id: data.id,
        comparePassword: async (password) => bcrypt.compare(password, data.password),
        generateAuthToken: () => {
          const payload = {
            id: data.id,
            username: data.username,
            email: data.email,
            role: data.role
          };
          
          return jwt.sign(payload, process.env.JWT_SECRET || 'defaultsecret', { expiresIn: '7d' });
        },
        save: async () => {
          const { data: updatedData, error } = await supabase
            .from('users')
            .update({
              last_login_at: new Date().toISOString()
            })
            .eq('id', data.id);
            
          if (error) throw error;
          return updatedData;
        }
      };
    },
    
    findById: async function(id) {
      const { supabase } = global;
      if (!supabase) throw new Error('Supabase client not initialized');
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) return null;
      
      return {
        ...data,
        _id: data.id
      };
    }
  };
}

module.exports = User; 