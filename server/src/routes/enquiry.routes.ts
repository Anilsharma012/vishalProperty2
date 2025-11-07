import { Router } from 'express';
import { z } from 'zod';
import Enquiry from '../models/Enquiry';
import { protect, requireAdmin, AuthRequest } from '../middleware/auth';
import { CustomError } from '../middleware/errorHandler';

const router = Router();

const enquirySchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional(),
  phone: z.string().min(10),
  message: z.string().min(5),
  propertyId: z.string().optional()
});

// Create enquiry (public)
router.post('/', async (req, res) => {
  const validated = enquirySchema.parse(req.body);

  const enquiry = await Enquiry.create({
    name: validated.name,
    email: validated.email,
    phone: validated.phone,
    message: validated.message,
    propertyId: validated.propertyId || null,
    status: 'new'
  });

  res.status(201).json({
    success: true,
    message: 'Enquiry submitted successfully',
    data: enquiry
  });
});

// Admin: Get all enquiries
router.get('/', protect, requireAdmin, async (req: AuthRequest, res) => {
  const status = req.query.status;
  
  const query: any = {};
  if (status) {
    query.status = status;
  }

  const enquiries = await Enquiry.find(query)
    .populate('propertyId', 'title slug')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    count: enquiries.length,
    data: enquiries
  });
});

// Admin: Get single enquiry
router.get('/:id', protect, requireAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;

  const enquiry = await Enquiry.findById(id).populate('propertyId', 'title slug');
  if (!enquiry) {
    throw new CustomError('Enquiry not found', 404);
  }

  res.json({
    success: true,
    data: enquiry
  });
});

// Admin: Update enquiry status
router.patch('/:id/status', protect, requireAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['new', 'reviewed', 'closed'];
  if (!validStatuses.includes(status)) {
    throw new CustomError('Invalid status', 400);
  }

  const enquiry = await Enquiry.findByIdAndUpdate(
    id,
    { status },
    { new: true }
  );

  if (!enquiry) {
    throw new CustomError('Enquiry not found', 404);
  }

  res.json({
    success: true,
    message: 'Enquiry updated successfully',
    data: enquiry
  });
});

// Admin: Delete enquiry
router.delete('/:id', protect, requireAdmin, async (req: AuthRequest, res) => {
  const { id } = req.params;

  const enquiry = await Enquiry.findByIdAndDelete(id);
  if (!enquiry) {
    throw new CustomError('Enquiry not found', 404);
  }

  res.json({
    success: true,
    message: 'Enquiry deleted successfully'
  });
});

export default router;
