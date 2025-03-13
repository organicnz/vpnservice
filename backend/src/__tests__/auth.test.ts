import request from 'supertest';
import { Express } from 'express';
import jwt from 'jsonwebtoken';

// Mock the supabase client
jest.mock('@supabase/supabase-js', () => {
  const mockData = {
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
    },
  };

  return {
    createClient: jest.fn().mockReturnValue({
      auth: {
        signUp: jest.fn().mockResolvedValue({ data: mockData, error: null }),
        signInWithPassword: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      },
      from: jest.fn().mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: {
            id: 'test-user-id',
            email: 'test@example.com',
            full_name: 'Test User',
            role: 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          error: null,
        }),
        insert: jest.fn().mockReturnThis(),
      }),
    }),
  };
});

// Mock JWT
jest.mock('jsonwebtoken');

// Import the app (dynamically to ensure mocks are applied first)
let app: Express;

describe('Auth Controller', () => {
  beforeAll(async () => {
    // Import the app after mocks are set up
    const appModule = await import('../index');
    app = appModule.default;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'test@example.com',
        password: 'Password123',
        fullName: 'Test User',
      });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('email', 'test@example.com');
    });

    it('should validate input data', async () => {
      const response = await request(app).post('/api/auth/register').send({
        email: 'invalid-email',
        password: 'short',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login a user and return a token', async () => {
      // Mock JWT sign to return a token
      (jwt.sign as jest.Mock).mockReturnValue('mock-token');

      const response = await request(app).post('/api/auth/login').send({
        email: 'test@example.com',
        password: 'Password123',
      });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('token', 'mock-token');
      expect(response.body.data.user).toHaveProperty('id', 'test-user-id');
    });

    it('should validate input data', async () => {
      const response = await request(app).post('/api/auth/login').send({
        email: 'invalid-email',
      });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/auth/profile', () => {
    it('should return user profile for authenticated user', async () => {
      // Mock JWT verify to simulate authenticated user
      (jwt.verify as jest.Mock).mockReturnValue({
        userId: 'test-user-id',
        email: 'test@example.com',
        role: 'user',
      });

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer mock-token');

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id', 'test-user-id');
      expect(response.body.data).toHaveProperty('email', 'test@example.com');
    });

    it('should return 401 if no token is provided', async () => {
      const response = await request(app).get('/api/auth/profile');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });

    it('should return 401 if invalid token is provided', async () => {
      // Mock JWT verify to throw error for invalid token
      (jwt.verify as jest.Mock).mockImplementation(() => {
        throw new Error('Invalid token');
      });

      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
    });
  });
}); 