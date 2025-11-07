import { Router } from 'express';
import User from '../models/User';
import { requireAuth, requireRole } from '../middleware/auth';
import mongoose from 'mongoose';

const router = Router();

router.get('/', requireAuth, requireRole('admin'), async (_req, res) => {
  const users = await User.find({}).select('name email role status createdAt').sort({ createdAt: -1 });
  res.json({ items: users });
});

router.patch('/:id/status', requireAuth, requireRole('admin'), async (req, res) => {
  const { id } = req.params;
  const { status } = req.body as { status: 'active'|'blocked' };
  if (!mongoose.isValidObjectId(id) || !['active','blocked'].includes(String(status))) return res.status(400).json({ message: 'Invalid input' });
  const user = await User.findByIdAndUpdate(id, { status }, { new: true }).select('name email role status createdAt');
  if (!user) return res.status(404).json({ message: 'Not found' });
  res.json({ user });
});

export default router;
