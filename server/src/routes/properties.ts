import { Router } from 'express';
import { z } from 'zod';
import Property from '../models/Property';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

const baseSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1),
  price: z.number().nonnegative(),
  propertyType: z.string().min(1),
  status: z.enum(['draft','pending','approved','rejected']).optional(),
  location: z.string().min(1),
  features: z.array(z.string()).optional(),
  description: z.string().optional(),
  images: z.array(z.string()).optional(),
  coverImage: z.string().optional(),
  premium: z.boolean().optional(),
  ownerContact: z.string().min(1),
});

router.get('/', async (req, res) => {
  const filter: any = {};
  if (req.query.status) filter.status = req.query.status;
  else filter.status = 'approved';
  const items = await Property.find(filter).sort({ createdAt: -1 });
  res.json({ items });
});

router.get('/:slug', async (req, res) => {
  const doc = await Property.findOne({ slug: req.params.slug });
  if (!doc) return res.status(404).json({ message: 'Not found' });
  if (doc.status !== 'approved') return res.status(403).json({ message: 'Not public' });
  res.json({ item: doc });
});

router.post('/', requireAuth, requireRole('admin'), async (req: any, res) => {
  const parsed = baseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input' });
  const exists = await Property.findOne({ slug: parsed.data.slug });
  if (exists) return res.status(409).json({ message: 'Slug already used' });
  const doc = await Property.create({ ...parsed.data, createdBy: req.user!.id });
  res.status(201).json({ item: doc });
});

router.put('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const parsed = baseSchema.partial().safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input' });
  const doc = await Property.findByIdAndUpdate(req.params.id, parsed.data, { new: true });
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json({ item: doc });
});

router.delete('/:id', requireAuth, requireRole('admin'), async (req, res) => {
  const doc = await Property.findByIdAndDelete(req.params.id);
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json({ ok: true });
});

export default router;
