import { Request, Response } from 'express';
import { getAllPlans, getPlanById } from '../services/subscriptionService';

/**
 * Controller method to get all available plans
 */
export const getPlans = async (_req: Request, res: Response): Promise<void> => {



  try {



  const plans = await getAllPlans();




  res.status(200).json({



  success: true,



  message: 'Plans retrieved successfully',



  data: plans,



  timestamp: new Date().toISOString(),



  });



  } catch (error) {



  console.error('Error in getPlans controller:', error);



  res.status(500).json({



  success: false,



  message: 'Failed to retrieve plans',



  error: 'Internal server error',



  timestamp: new Date().toISOString(),



  });



  }
};

/**
 * Controller method to get a plan by ID
 */
export const getPlan = async (req: Request, res: Response): Promise<void> => {



  try {



  const { id } = req.params;



  const plan = await getPlanById(id);




  if (!plan) {



  res.status(404).json({



  success: false,



  message: 'Plan not found',



  error: 'Plan with the specified ID does not exist',



  timestamp: new Date().toISOString(),



  });



  return;



  }




  res.status(200).json({



  success: true,



  message: 'Plan retrieved successfully',



  data: plan,



  timestamp: new Date().toISOString(),



  });



  } catch (error) {



  console.error('Error in getPlan controller:', error);



  res.status(500).json({



  success: false,



  message: 'Failed to retrieve plan',



  error: 'Internal server error',



  timestamp: new Date().toISOString(),



  });



  }
}; 