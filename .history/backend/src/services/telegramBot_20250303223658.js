const TelegramBot = require('node-telegram-bot-api');
const logger = require('../utils/logger');
const User = require('../models/user');
const Subscription = require('../models/subscription');
const PaymentService = require('./payment');
const VpnService = require('./vpn');

// Command list
const COMMANDS = {
  START: '/start',
  HELP: '/help',
  REGISTER: '/register',
  SUBSCRIBE: '/subscribe',
  STATUS: '/status',
  EXTEND: '/extend',
  SERVERS: '/servers',
  CONFIG: '/config',
  SUPPORT: '/support',
  CANCEL: '/cancel'
};

// User session state
const sessions = new Map();

/**
 * Setup and configure the Telegram bot
 */
function setupBot() {
  // Check if token is provided
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    logger.error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
    process.exit(1);
  }

  // Create a bot instance
  const bot = new TelegramBot(token, { polling: true });
  
  // Setup command handlers
  setupCommandHandlers(bot);
  
  // Setup callback query handlers
  setupCallbackQueryHandlers(bot);
  
  // Error handling
  bot.on('polling_error', (error) => {
    logger.error(`Polling error: ${error.message}`);
  });

  return bot;
}

/**
 * Setup command handlers for the bot
 */
function setupCommandHandlers(bot) {
  // Start command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username || msg.from.first_name;
    
    const message = `Welcome, ${username}! 🌐\n\n`
      + `I am your VPN subscription assistant. Here's what I can do for you:\n\n`
      + `${COMMANDS.REGISTER} - Create a new account\n`
      + `${COMMANDS.SUBSCRIBE} - Purchase a subscription plan\n`
      + `${COMMANDS.STATUS} - Check your subscription status\n`
      + `${COMMANDS.CONFIG} - Get your VPN configuration\n`
      + `${COMMANDS.SERVERS} - View available server locations\n`
      + `${COMMANDS.SUPPORT} - Contact support\n`
      + `${COMMANDS.HELP} - Show this help message`;
    
    await bot.sendMessage(chatId, message);

    // Check if user exists in the database
    try {
      const user = await User.findOne({ telegramId: String(chatId) });
      if (!user) {
        await bot.sendMessage(chatId, `It looks like you're new here. Use ${COMMANDS.REGISTER} to create an account.`);
      }
    } catch (error) {
      logger.error(`Error checking user: ${error.message}`);
    }
  });

  // Help command
  bot.onText(/\/help/, async (msg) => {
    const chatId = msg.chat.id;
    
    const message = `📚 *Available Commands*\n\n`
      + `${COMMANDS.REGISTER} - Create a new account\n`
      + `${COMMANDS.SUBSCRIBE} - Purchase a subscription plan\n`
      + `${COMMANDS.STATUS} - Check your subscription status\n`
      + `${COMMANDS.EXTEND} - Extend your current subscription\n`
      + `${COMMANDS.CONFIG} - Get your VPN configuration\n`
      + `${COMMANDS.SERVERS} - View available server locations\n`
      + `${COMMANDS.SUPPORT} - Contact support\n`
      + `${COMMANDS.CANCEL} - Cancel the current operation`;
    
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  });

  // Register command
  bot.onText(/\/register/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ telegramId: String(chatId) });
      if (existingUser) {
        return bot.sendMessage(chatId, 'You are already registered! Use /subscribe to purchase a subscription.');
      }
      
      // Start registration process
      sessions.set(chatId, { state: 'AWAITING_EMAIL' });
      
      await bot.sendMessage(chatId, 'Please enter your email address:');
    } catch (error) {
      logger.error(`Registration error: ${error.message}`);
      await bot.sendMessage(chatId, 'Sorry, there was an error processing your request. Please try again later.');
    }
  });

  // Subscribe command
  bot.onText(/\/subscribe/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
      // Check if user exists
      const user = await User.findOne({ telegramId: String(chatId) });
      if (!user) {
        return bot.sendMessage(chatId, `You need to register first. Use ${COMMANDS.REGISTER} to create an account.`);
      }
      
      // Show subscription plans
      const plans = [
        { id: 'basic', name: 'Basic', price: 300, duration: 30, traffic: 50 },
        { id: 'standard', name: 'Standard', price: 600, duration: 30, traffic: 150 },
        { id: 'premium', name: 'Premium', price: 900, duration: 30, traffic: 500 }
      ];
      
      const options = {
        reply_markup: {
          inline_keyboard: plans.map(plan => [
            { text: `${plan.name} - ${plan.price} RUB (${plan.traffic}GB / ${plan.duration} days)`, callback_data: `plan_${plan.id}` }
          ])
        }
      };
      
      await bot.sendMessage(chatId, 'Choose a subscription plan:', options);
    } catch (error) {
      logger.error(`Subscribe error: ${error.message}`);
      await bot.sendMessage(chatId, 'Sorry, there was an error processing your request. Please try again later.');
    }
  });

  // Status command
  bot.onText(/\/status/, async (msg) => {
    const chatId = msg.chat.id;
    
    try {
      // Check if user exists
      const user = await User.findOne({ telegramId: String(chatId) });
      if (!user) {
        return bot.sendMessage(chatId, `You need to register first. Use ${COMMANDS.REGISTER} to create an account.`);
      }
      
      // Get user's active subscription
      const subscription = await Subscription.findOne({ 
        userId: user._id,
        status: 'active',
        endDate: { $gt: new Date() }
      }).sort({ endDate: -1 });
      
      if (!subscription) {
        return bot.sendMessage(chatId, 'You don\'t have an active subscription. Use /subscribe to purchase one.');
      }
      
      // Calculate remaining days
      const now = new Date();
      const endDate = new Date(subscription.endDate);
      const remainingDays = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
      
      // Format traffic usage
      const usedTraffic = subscription.usedTraffic || 0;
      const totalTraffic = subscription.trafficLimit;
      const remainingTraffic = Math.max(0, totalTraffic - usedTraffic);
      
      const message = `📊 *Subscription Status*\n\n`
        + `Plan: ${subscription.planName}\n`
        + `Status: Active\n`
        + `Traffic: ${usedTraffic.toFixed(2)}GB / ${totalTraffic}GB (${remainingTraffic.toFixed(2)}GB remaining)\n`
        + `Expires in: ${remainingDays} days (${endDate.toLocaleDateString()})\n\n`
        + `Use ${COMMANDS.EXTEND} to extend your subscription.`;
      
      await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
    } catch (error) {
      logger.error(`Status error: ${error.message}`);
      await bot.sendMessage(chatId, 'Sorry, there was an error processing your request. Please try again later.');
    }
  });

  // Handle text messages (for registration flow, etc.)
  bot.on('message', async (msg) => {
    if (msg.text && !msg.text.startsWith('/')) {
      const chatId = msg.chat.id;
      const session = sessions.get(chatId);
      
      if (!session) return;
      
      if (session.state === 'AWAITING_EMAIL') {
        const email = msg.text.trim();
        
        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          return bot.sendMessage(chatId, 'Please enter a valid email address:');
        }
        
        try {
          // Create new user
          const newUser = new User({
            telegramId: String(chatId),
            username: msg.from.username || `user_${chatId}`,
            email: email,
            createdAt: new Date()
          });
          
          await newUser.save();
          
          // Clear session
          sessions.delete(chatId);
          
          await bot.sendMessage(chatId, 'Registration successful! ✅\n\nUse /subscribe to purchase a subscription plan.');
        } catch (error) {
          logger.error(`User creation error: ${error.message}`);
          await bot.sendMessage(chatId, 'Sorry, there was an error creating your account. Please try again later.');
        }
      }
    }
  });
}

/**
 * Setup callback query handlers for inline buttons
 */
function setupCallbackQueryHandlers(bot) {
  bot.on('callback_query', async (callbackQuery) => {
    const chatId = callbackQuery.message.chat.id;
    const data = callbackQuery.data;
    
    // Handle subscription plan selection
    if (data.startsWith('plan_')) {
      const planId = data.replace('plan_', '');
      
      try {
        // Get user
        const user = await User.findOne({ telegramId: String(chatId) });
        if (!user) {
          return bot.sendMessage(chatId, `You need to register first. Use ${COMMANDS.REGISTER} to create an account.`);
        }
        
        // Get plan details
        const plans = {
          basic: { name: 'Basic', price: 300, duration: 30, traffic: 50 },
          standard: { name: 'Standard', price: 600, duration: 30, traffic: 150 },
          premium: { name: 'Premium', price: 900, duration: 30, traffic: 500 }
        };
        
        const selectedPlan = plans[planId];
        if (!selectedPlan) {
          return bot.sendMessage(chatId, 'Invalid plan selected. Please try again.');
        }
        
        // Create payment link/invoice
        const paymentLink = await PaymentService.createPayment(user._id, selectedPlan.price, planId);
        
        // Store payment info in session
        sessions.set(chatId, { 
          state: 'AWAITING_PAYMENT',
          paymentInfo: {
            userId: user._id,
            planId,
            planName: selectedPlan.name,
            price: selectedPlan.price,
            duration: selectedPlan.duration,
            traffic: selectedPlan.traffic
          }
        });
        
        const message = `You have selected the *${selectedPlan.name} Plan*\n\n`
          + `Price: ${selectedPlan.price} RUB\n`
          + `Duration: ${selectedPlan.duration} days\n`
          + `Traffic: ${selectedPlan.traffic}GB\n\n`
          + `Please use the link below to complete your payment:`;
        
        await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
        await bot.sendMessage(chatId, paymentLink);
        
        // For demo purposes - simulate payment confirmation
        // In production, this would be handled by a payment webhook
        setTimeout(async () => {
          await handlePaymentConfirmation(bot, chatId, user._id, planId);
        }, 10000);
      } catch (error) {
        logger.error(`Plan selection error: ${error.message}`);
        await bot.sendMessage(chatId, 'Sorry, there was an error processing your request. Please try again later.');
      }
    }
    
    // Handle server selection
    if (data.startsWith('server_')) {
      const serverId = data.replace('server_', '');
      
      try {
        // Get user
        const user = await User.findOne({ telegramId: String(chatId) });
        if (!user) {
          return bot.sendMessage(chatId, `You need to register first. Use ${COMMANDS.REGISTER} to create an account.`);
        }
        
        // Check for active subscription
        const subscription = await Subscription.findOne({ 
          userId: user._id,
          status: 'active',
          endDate: { $gt: new Date() }
        });
        
        if (!subscription) {
          return bot.sendMessage(chatId, 'You don\'t have an active subscription. Use /subscribe to purchase one.');
        }
        
        // Get VPN config for selected server
        const vpnConfig = await VpnService.generateUserConfig(user._id, serverId);
        
        await bot.sendMessage(chatId, `Here is your VPN configuration for server ${serverId}:`);
        await bot.sendMessage(chatId, `\`\`\`\n${vpnConfig}\n\`\`\``, { parse_mode: 'Markdown' });
      } catch (error) {
        logger.error(`Server selection error: ${error.message}`);
        await bot.sendMessage(chatId, 'Sorry, there was an error processing your request. Please try again later.');
      }
    }
    
    // Answer callback query to remove loading state
    bot.answerCallbackQuery(callbackQuery.id);
  });
}

/**
 * Handle payment confirmation (this would be called by payment webhook in production)
 */
async function handlePaymentConfirmation(bot, chatId, userId, planId) {
  try {
    const session = sessions.get(chatId);
    if (!session || session.state !== 'AWAITING_PAYMENT') return;
    
    const { planName, duration, traffic } = session.paymentInfo;
    
    // Create subscription
    const now = new Date();
    const endDate = new Date();
    endDate.setDate(now.getDate() + duration);
    
    const subscription = new Subscription({
      userId,
      planId,
      planName,
      status: 'active',
      trafficLimit: traffic,
      startDate: now,
      endDate: endDate,
      usedTraffic: 0
    });
    
    await subscription.save();
    
    // Create VPN account in 3x-ui
    const vpnUsername = `user_${userId.toString().slice(-6)}`;
    const vpnPassword = Math.random().toString(36).slice(-8);
    
    await VpnService.createUserAccount(userId, vpnUsername, vpnPassword);
    
    // Clear session
    sessions.delete(chatId);
    
    // Send confirmation message
    const message = `✅ *Payment Confirmed!*\n\n`
      + `Your ${planName} subscription has been activated.\n\n`
      + `Duration: ${duration} days\n`
      + `Expires on: ${endDate.toLocaleDateString()}\n`
      + `Traffic limit: ${traffic}GB\n\n`
      + `Use ${COMMANDS.CONFIG} to get your VPN configuration.`;
    
    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
  } catch (error) {
    logger.error(`Payment confirmation error: ${error.message}`);
    await bot.sendMessage(chatId, 'Sorry, there was an error activating your subscription. Please contact support.');
  }
}

module.exports = { setupBot }; 