import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get organization details
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    // Check if user belongs to this organization
    if (req.user!.organizationId !== id && req.user!.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Access denied' });
    }

    const organization = await prisma.organization.findUnique({
      where: { id },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            role: true,
            isActive: true
          }
        },
        _count: {
          select: {
            transactions: true
          }
        }
      }
    });

    if (!organization) {
      return res.status(404).json({ error: 'Organization not found' });
    }

    res.json(organization);
  } catch (error) {
    console.error('Get organization error:', error);
    res.status(500).json({ error: 'Failed to get organization' });
  }
});

// Update organization
router.put(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { name, description, address, phone, email } = req.body;

      // Check if user belongs to this organization
      if (req.user!.organizationId !== id) {
        return res.status(403).json({ error: 'Access denied' });
      }

      const organization = await prisma.organization.update({
        where: { id },
        data: {
          name,
          description,
          address,
          phone,
          email
        }
      });

      res.json(organization);
    } catch (error) {
      console.error('Update organization error:', error);
      res.status(500).json({ error: 'Failed to update organization' });
    }
  }
);

export { router as organizationRouter };

