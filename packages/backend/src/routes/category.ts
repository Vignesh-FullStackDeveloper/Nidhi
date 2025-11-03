import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all categories
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { type } = req.query;

    const categories = await prisma.category.findMany({
      where: {
        organizationId: req.user!.organizationId,
        ...(type && { type: type as any })
      },
      orderBy: { name: 'asc' }
    });

    res.json(categories);
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// Create category
router.post(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'USER'),
  [
    body('name').notEmpty(),
    body('type').isIn(['INCOME', 'EXPENSE'])
  ],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, description, type } = req.body;

      const category = await prisma.category.create({
        data: {
          name,
          description,
          type,
          organizationId: req.user!.organizationId
        }
      });

      res.status(201).json(category);
    } catch (error: any) {
      if (error.code === 'P2002') {
        return res.status(400).json({ error: 'Category already exists' });
      }
      console.error('Create category error:', error);
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
);

// Update category
router.put(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'USER'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { name, description } = req.body;

      // Check if category belongs to same organization
      const targetCategory = await prisma.category.findUnique({ where: { id } });
      if (!targetCategory || targetCategory.organizationId !== req.user!.organizationId) {
        return res.status(404).json({ error: 'Category not found' });
      }

      const category = await prisma.category.update({
        where: { id },
        data: { name, description }
      });

      res.json(category);
    } catch (error) {
      console.error('Update category error:', error);
      res.status(500).json({ error: 'Failed to update category' });
    }
  }
);

// Delete category
router.delete(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      // Check if category belongs to same organization
      const targetCategory = await prisma.category.findUnique({ where: { id } });
      if (!targetCategory || targetCategory.organizationId !== req.user!.organizationId) {
        return res.status(404).json({ error: 'Category not found' });
      }

      await prisma.category.delete({ where: { id } });

      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Delete category error:', error);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  }
);

export { router as categoryRouter };

