import { Router } from 'express';
import User from '../models/User';
import { protect, requireAdmin, AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';

const router = Router();

// Admin: Get all users
router.get('/', protect, requireAdmin, async (req: AuthRequest, res) => {
  const users = await User.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    count: users.length,
    data: users
  });
});

// Admin: Get single user
router.get('/:id', protect, requireAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;

  const user = await User.findById(id);
  if (!user) {
    throw new CustomError('User not found', 404);
  }

  res.json({
    success: true,
    data: user
  });
});

// Admin: Update user status
router.patch('/:id/status', protect, requireAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['active', 'blocked'];
  if (!validStatuses.includes(status)) {
    throw new CustomError('Invalid status', 400);
  }

  const user = await User.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!user) {
    throw new CustomError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'User updated successfully',
    data: user
  });
});

// Admin: Delete user
router.delete('/:id', protect, requireAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;

  if (id === req.user?.id) {
    throw new CustomError('Cannot delete your own account', 400);
  }

  const user = await User.findByIdAndDelete(id);
  if (!user) {
    throw new CustomError('User not found', 404);
  }

  res.json({
    success: true,
    message: 'User deleted successfully'
  });
});

export default router;
