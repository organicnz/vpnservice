import { Request, Response } from 'express';
import { check as body, validationResult } from "express-validator";
import { registerUser, loginUser, getUserById } from '../services/authService';

/**
 * Validation rules for user registration
 */
export const registerValidation = [




  body('email').isEmail().withMessage('Please provide a valid email'),




  body('password')




  .isLength({ min: 8 })




  .withMessage('Password must be at least 8 characters long')




  .matches(/[A-Z]/)




  .withMessage('Password must contain at least one uppercase letter')




  .matches(/[a-z]/)




  .withMessage('Password must contain at least one lowercase letter')




  .matches(/[0-9]/)




  .withMessage('Password must contain at least one number'),




  body('fullName').optional().isString().withMessage('Full name must be a string'),
];

/**
 * Validation rules for user login
 */
export const loginValidation = [




  body('email').isEmail().withMessage('Please provide a valid email'),




  body('password').notEmpty().withMessage('Password is required'),
];

/**
 * Controller method to register a new user
 */
export const register = async (req: Request, res: Response): Promise<void> => {




  try {




  // Check for validation errors




  const errors = validationResult(req);




  if (!errors.isEmpty()) {




  res.status(400).json({




  success: false,




  message: 'Validation failed',




  errors: errors.array(),




  timestamp: new Date().toISOString(),




  });




  return;




  }





  const { email, password, fullName } = req.body;





  // Check if user already exists




  const user = await registerUser(email, password, fullName);





  if (!user) {




  res.status(400).json({




  success: false,




  message: 'Registration failed',




  error: 'User with this email may already exist',




  timestamp: new Date().toISOString(),




  });




  return;




  }





  res.status(201).json({




  success: true,




  message: 'User registered successfully',




  data: {




  id: user.id,




  email: user.email,




  fullName: user.full_name,




  role: user.role,




  createdAt: user.created_at,




  },




  timestamp: new Date().toISOString(),




  });




  } catch (error) {




  console.error('Error in register controller:', error);




  res.status(500).json({




  success: false,




  message: 'Registration failed',




  error: 'Internal server error',




  timestamp: new Date().toISOString(),




  });




  }
};

/**
 * Controller method to login a user
 */
export const login = async (req: Request, res: Response): Promise<void> => {




  try {




  // Check for validation errors




  const errors = validationResult(req);




  if (!errors.isEmpty()) {




  res.status(400).json({




  success: false,




  message: 'Validation failed',




  errors: errors.array(),




  timestamp: new Date().toISOString(),




  });




  return;




  }





  const { email, password } = req.body;





  // Attempt to login user




  const { user, token } = await loginUser(email, password);





  if (!user || !token) {




  res.status(401).json({




  success: false,




  message: 'Authentication failed',




  error: 'Invalid email or password',




  timestamp: new Date().toISOString(),




  });




  return;




  }





  res.status(200).json({




  success: true,




  message: 'Login successful',




  data: {




  user: {




  id: user.id,




  email: user.email,




  fullName: user.full_name,




  role: user.role,




  },




  token,




  },




  timestamp: new Date().toISOString(),




  });




  } catch (error) {




  console.error('Error in login controller:', error);




  res.status(500).json({




  success: false,




  message: 'Login failed',




  error: 'Internal server error',




  timestamp: new Date().toISOString(),




  });




  }
};

/**
 * Controller method to get current user profile
 */
export const getProfile = async (req: Request, res: Response): Promise<void> => {




  try {




  if (!req.user) {




  res.status(401).json({




  success: false,




  message: 'Authentication required',




  error: 'User not found in request',




  timestamp: new Date().toISOString(),




  });




  return;




  }





  const user = await getUserById(req.user.id);





  if (!user) {




  res.status(404).json({




  success: false,




  message: 'User not found',




  error: 'User profile could not be retrieved',




  timestamp: new Date().toISOString(),




  });




  return;




  }





  res.status(200).json({




  success: true,




  message: 'Profile retrieved successfully',




  data: {




  id: user.id,




  email: user.email,




  fullName: user.full_name,




  role: user.role,




  telegramId: user.telegram_id,




  createdAt: user.created_at,




  updatedAt: user.updated_at,




  },




  timestamp: new Date().toISOString(),




  });




  } catch (error) {




  console.error('Error in getProfile controller:', error);




  res.status(500).json({




  success: false,




  message: 'Failed to retrieve profile',




  error: 'Internal server error',




  timestamp: new Date().toISOString(),




  });




  }
}; 