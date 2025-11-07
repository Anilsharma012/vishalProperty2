import { Router } from 'express';
import { z } from 'zod';
import User from '../models/User';
import { signToken, requireAuth, AuthedRequest } from '../middleware/auth';

const router = Router();

const signupSchema = z.object({ name: z.string().min(1), email: z.string().email(), password: z.string().min(6), phone: z.string().optional() });
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });

router.post('/signup', async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input' });
  const { name, email, password, phone } = parsed.data;
  const exists = await User.findOne({ email });
  if (exists) return res.status(409).json({ message: 'Email already in use' });
  const user = await User.create({ name, email, password, phone, role: 'user', status: 'active' });
  const token = signToken({ id: user.id, role: 'user', email: user.email });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7*24*60*60*1000 });
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status }, token });
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input' });
  const { email, password } = parsed.data;
  const user: any = await User.findOne({ email });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const match = await user.comparePassword(password);
  if (!match) return res.status(400).json({ message: 'Invalid credentials' });
  if (user.status === 'blocked') return res.status(403).json({ message: 'Account blocked' });
  const token = signToken({ id: user.id, role: user.role, email: user.email });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7*24*60*60*1000 });
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status }, token });
});

router.post('/admin/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input' });
  const { email, password } = parsed.data;
  const user: any = await User.findOne({ email, role: 'admin' });
  if (!user) return res.status(400).json({ message: 'Invalid credentials' });
  const match = await user.comparePassword(password);
  if (!match) return res.status(400).json({ message: 'Invalid credentials' });
  const token = signToken({ id: user.id, role: user.role, email: user.email });
  res.cookie('token', token, { httpOnly: true, sameSite: 'lax', secure: false, maxAge: 7*24*60*60*1000 });
  res.json({ user: { id: user.id, name: user.name, email: user.email, role: user.role, status: user.status }, token });
});

router.post('/logout', (_req, res) => {
  res.clearCookie('token');
  res.json({ ok: true });
});

router.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  const user = await User.findById(req.user!.id).select('name email role status');
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json({ user });
});

export default router;
