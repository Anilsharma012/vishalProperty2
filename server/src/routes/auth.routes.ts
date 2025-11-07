import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import User from '../models/User';
import { protect, AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';

const router = Router();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(6),
  confirmPassword: z.string().min(6)
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"]
});

const generateToken = (user: any) => {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// Admin Login
router.post('/admin/login', async (req, res) => {
  const validated = loginSchema.parse(req.body);

  const user = await User.findOne({ email: validated.email });
  if (!user) {
    throw new CustomError('Invalid credentials', 401);
  }

  if (user.role !== 'admin') {
    throw new CustomError('Admin access required', 403);
  }

  if (user.status === 'blocked') {
    throw new CustomError('Account is blocked', 403);
  }

  const passwordMatch = await user.comparePassword(validated.password);
  if (!passwordMatch) {
    throw new CustomError('Invalid credentials', 401);
  }

  const token = generateToken(user);
  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: user.toJSON()
  });
});

// User Login
router.post('/login', async (req, res) => {
  const validated = loginSchema.parse(req.body);

  const user = await User.findOne({ email: validated.email });
  if (!user) {
    throw new CustomError('Invalid credentials', 401);
  }

  if (user.status === 'blocked') {
    throw new CustomError('Account is blocked', 403);
  }

  const passwordMatch = await user.comparePassword(validated.password);
  if (!passwordMatch) {
    throw new CustomError('Invalid credentials', 401);
  }

  const token = generateToken(user);
  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: user.toJSON()
  });
});

// User Signup
router.post('/signup', async (req, res) => {
  const validated = signupSchema.parse(req.body);

  const existingUser = await User.findOne({ email: validated.email });
  if (existingUser) {
    throw new CustomError('Email already in use', 400);
  }

  const user = await User.create({
    name: validated.name,
    email: validated.email,
    phone: validated.phone,
    password: validated.password,
    role: 'user',
    status: 'active'
  });

  const token = generateToken(user);
  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    token,
    user: user.toJSON()
  });
});

// Get current user
router.get('/me', protect, async (req: AuthRequest, res) => {
  const user = await User.findById(req.user?.id);
  if (!user) {
    throw new CustomError('User not found', 404);
  }

  res.json({
    success: true,
    user: user.toJSON()
  });
});

// Logout (client-side token deletion, no server action needed)
router.post('/logout', protect, (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

export default router;
