import { Request, Response, NextFunction } from 'express';
import NodeCache from 'node-cache';

// Default TTL for cache entries in seconds
const DEFAULT_TTL = 300; // 5 minutes

// Create a cache instance
const cache = new NodeCache({
  stdTTL: DEFAULT_TTL,
  checkperiod: 120, // Check for expired entries every 2 minutes
  useClones: false, // Don't clone objects when retrieving from cache
});

/**
 * A map of route patterns to their cache TTL
 * Route-specific TTL overrides the default TTL
 */
const routeTtlMap: Record<string, number> = {
  '/api/plans': 3600, // Plans change infrequently (1 hour)
  '/api/servers': 1800, // Server list (30 minutes)
  '/api/health': 60, // Health check (1 minute)
  // Add more routes with specific TTLs as needed
};

/**
 * Get cache key based on the request
 * @param req Express request object
 * @returns Cache key
 */
const getCacheKey = (req: Request): string => {
  // Include request method, URL, and query params in the cache key
  const queryParams = new URLSearchParams(req.query as Record<string, string>).toString();
  return `${req.method}:${req.originalUrl}${queryParams ? `?${queryParams}` : ''}`;
};

/**
 * Get TTL for a specific route
 * @param url Route URL
 * @returns TTL in seconds
 */
const getTtl = (url: string): number => {
  // Find matching route pattern and return its TTL, or default TTL
  const matchingRoute = Object.keys(routeTtlMap).find(pattern => 
    url.startsWith(pattern)
  );
  
  return matchingRoute ? routeTtlMap[matchingRoute] : DEFAULT_TTL;
};

/**
 * Routes that should never be cached
 */
const nonCacheableRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/logout',
  '/api/users/profile', // User-specific data
];

/**
 * HTTP methods that should not be cached
 */
const nonCacheableMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

/**
 * Middleware to cache API responses
 * @param req Express request object
 * @param res Express response object
 * @param next Next function
 */
export const cacheMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Skip caching for non-cacheable routes or methods
  if (
    nonCacheableMethods.includes(req.method) ||
    nonCacheableRoutes.some(route => req.path.startsWith(route))
  ) {
    return next();
  }

  // Get cache key
  const key = getCacheKey(req);
  
  // Check if response exists in cache
  const cachedResponse = cache.get(key);
  if (cachedResponse) {
    // Return cached response
    return res.status(200).json(cachedResponse);
  }

  // Store original send method
  const originalSend = res.json;
  
  // Override json method to cache response before sending
  res.json = function(body): Response {
    // Only cache successful responses
    if (res.statusCode >= 200 && res.statusCode < 300) {
      // Get TTL for this route
      const ttl = getTtl(req.originalUrl);
      
      // Store response in cache
      cache.set(key, body, ttl);
    }
    
    // Call original json method
    return originalSend.call(this, body);
  };
  
  next();
};

/**
 * Clear the entire cache
 */
export const clearCache = (): void => {
  cache.flushAll();
};

/**
 * Clear cache for specific route pattern
 * @param routePattern Route pattern to clear cache for
 */
export const clearCacheForRoute = (routePattern: string): void => {
  const keys = cache.keys();
  const keysToDelete = keys.filter(key => key.includes(routePattern));
  
  keysToDelete.forEach(key => {
    cache.del(key);
  });
}; 