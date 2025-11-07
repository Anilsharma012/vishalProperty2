import { Router } from 'express';
import { z } from 'zod';
import Enquiry from '../models/Enquiry';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.post('/', async (req, res) => {
  const schema = z.object({ name: z.string().min(1), email: z.string().email().optional(), phone: z.string().min(5), message: z.string().min(1), propertyId: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input' });
  const doc = await Enquiry.create(parsed.data);
  res.status(201).json({ enquiry: doc });
});

router.get('/', requireAuth, requireRole('admin'), async (_req, res) => {
  const docs = await Enquiry.find({}).sort({ createdAt: -1 });
  res.json({ items: docs });
});

export default router;
