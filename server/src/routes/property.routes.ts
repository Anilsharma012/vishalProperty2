import { Router } from 'express';
import { z } from 'zod';
import Property from '../models/Property';
import { protect, requireAdmin, AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';

const router = Router();

const propertySchema = z.object({
  title: z.string().min(3),
  slug: z.string().min(3).toLowerCase(),
  price: z.number().positive(),
  propertyType: z.string(),
  status: z.enum(['active', 'draft', 'sold']).default('draft'),
  location: z.string(),
  city: z.string().optional(),
  area: z.number().optional(),
  bedrooms: z.number().optional(),
  bathrooms: z.number().optional(),
  features: z.array(z.string()).default([]),
  description: z.string(),
  images: z.array(z.string()).default([]),
  coverImage: z.string().optional(),
  premium: z.boolean().default(false),
  ownerContact: z.string()
});

// Get all properties (public - only active)
router.get('/', async (req, res) => {
  const status = req.query.status || 'active';
  
  let query: any = {};
  if (status === 'active') {
    query.status = 'active';
  }

  const properties = await Property.find(query).sort({ createdAt: -1 });
  
  res.json({
    success: true,
    count: properties.length,
    data: properties
  });
});

// Get properties by city
router.get('/city/:city', async (req, res) => {
  const { city } = req.params;
  
  const properties = await Property.find({
    status: 'active',
    city: { $regex: city, $options: 'i' }
  }).sort({ createdAt: -1 });

  res.json({
    success: true,
    count: properties.length,
    data: properties
  });
});

// Get single property by ID or slug
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  let property = await Property.findById(id);
  
  if (!property) {
    property = await Property.findOne({ slug: id });
  }

  if (!property) {
    throw new CustomError('Property not found', 404);
  }

  res.json({
    success: true,
    data: property
  });
});

// Admin: Get all properties (including drafts)
router.get('/admin/all', protect, requireAdmin, async (req: AuthRequest, res) => {
  const properties = await Property.find().sort({ createdAt: -1 });
  
  res.json({
    success: true,
    count: properties.length,
    data: properties
  });
});

// Admin: Create property
router.post('/', protect, requireAdmin, async (req: AuthRequest, res) => {
  const validated = propertySchema.parse(req.body);

  const existingSlug = await Property.findOne({ slug: validated.slug });
  if (existingSlug) {
    throw new CustomError('Slug already exists', 400);
  }

  const property = await Property.create({
    ...validated,
    createdBy: req.user?.id
  });

  res.status(201).json({
    success: true,
    message: 'Property created successfully',
    data: property
  });
});

// Admin: Update property
router.put('/:id', protect, requireAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const validated = propertySchema.partial().parse(req.body);

  const property = await Property.findById(id);
  if (!property) {
    throw new CustomError('Property not found', 404);
  }

  if (validated.slug && validated.slug !== property.slug) {
    const existingSlug = await Property.findOne({ 
      slug: validated.slug,
      _id: { $ne: id }
    });
    if (existingSlug) {
      throw new CustomError('Slug already exists', 400);
    }
  }

  const updated = await Property.findByIdAndUpdate(id, validated, { new: true });

  res.json({
    success: true,
    message: 'Property updated successfully',
    data: updated
  });
});

// Admin: Delete property
router.delete('/:id', protect, requireAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;

  const property = await Property.findByIdAndDelete(id);
  if (!property) {
    throw new CustomError('Property not found', 404);
  }

  res.json({
    success: true,
    message: 'Property deleted successfully'
  });
});

export default router;
