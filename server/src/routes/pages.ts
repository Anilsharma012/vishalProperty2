import { Router } from 'express';
import { z } from 'zod';
import Page from '../models/Page';
import { requireAuth, requireRole } from '../middleware/auth';

const router = Router();

router.get('/:slug', async (req, res) => {
  const doc = await Page.findOne({ slug: req.params.slug });
  if (!doc) return res.status(404).json({ message: 'Not found' });
  res.json({ page: doc });
});

router.put('/:slug', requireAuth, requireRole('admin'), async (req, res) => {
  const schema = z.object({ title: z.string().min(1), content: z.string().optional(), metaTitle: z.string().optional(), metaDescription: z.string().optional() });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ message: 'Invalid input' });
  const doc = await Page.findOneAndUpdate({ slug: req.params.slug }, { slug: req.params.slug, ...parsed.data }, { upsert: true, new: true });
  res.json({ page: doc });
});

export default router;
