import { Router } from 'express';
import { z } from 'zod';
import Page from '../models/Page';
import { protect, requireAdmin, AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';

const router = Router();

const pageSchema = z.object({
  slug: z.string().min(3).toLowerCase(),
  title: z.string().min(3),
  content: z.string().min(10),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional()
});

// Get page by slug (public)
router.get('/:slug', async (req, res) => {
  const { slug } = req.params;

  const page = await Page.findOne({ slug });
  if (!page) {
    throw new CustomError('Page not found', 404);
  }

  res.json({
    success: true,
    data: page
  });
});

// Admin: Create page
router.post('/', protect, requireAdmin, async (req: AuthRequest, res) => {
  const validated = pageSchema.parse(req.body);

  const existingPage = await Page.findOne({ slug: validated.slug });
  if (existingPage) {
    throw new CustomError('Slug already exists', 400);
  }

  const page = await Page.create(validated);

  res.status(201).json({
    success: true,
    message: 'Page created successfully',
    data: page
  });
});

// Admin: Update page
router.put('/:id', protect, requireAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const validated = pageSchema.partial().parse(req.body);

  const page = await Page.findById(id);
  if (!page) {
    throw new CustomError('Page not found', 404);
  }

  if (validated.slug && validated.slug !== page.slug) {
    const existingPage = await Page.findOne({ 
      slug: validated.slug,
      _id: { $ne: id }
    });
    if (existingPage) {
      throw new CustomError('Slug already exists', 400);
    }
  }

  const updated = await Page.findByIdAndUpdate(id, validated, { new: true });

  res.json({
    success: true,
    message: 'Page updated successfully',
    data: updated
  });
});

// Admin: Delete page
router.delete('/:id', protect, requireAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;

  const page = await Page.findByIdAndDelete(id);
  if (!page) {
    throw new CustomError('Page not found', 404);
  }

  res.json({
    success: true,
    message: 'Page deleted successfully'
  });
});

// Admin: Get all pages
router.get('/admin/list', protect, requireAdmin, async (req: AuthRequest, res) => {
  const pages = await Page.find().sort({ updatedAt: -1 });

  res.json({
    success: true,
    count: pages.length,
    data: pages
  });
});

export default router;
