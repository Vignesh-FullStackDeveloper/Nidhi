import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all users in organization
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { organizationId: req.user!.organizationId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Create user
router.post(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  [
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('firstName').notEmpty(),
    body('lastName').notEmpty(),
    body('role').isIn(['ADMIN', 'USER', 'VIEWER'])
  ],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { email, password, firstName, lastName, phone, role } = req.body;

      // Check if user exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
          firstName,
          lastName,
          phone,
          role,
          organizationId: req.user!.organizationId
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      });

      res.status(201).json(user);
    } catch (error) {
      console.error('Create user error:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  }
);

// Update user
router.put(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, phone, role, isActive } = req.body;

      // Check if user belongs to same organization
      const targetUser = await prisma.user.findUnique({ where: { id } });
      if (!targetUser || targetUser.organizationId !== req.user!.organizationId) {
        return res.status(404).json({ error: 'User not found' });
      }

      const user = await prisma.user.update({
        where: { id },
        data: {
          firstName,
          lastName,
          phone,
          role,
          isActive
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      });

      res.json(user);
    } catch (error) {
      console.error('Update user error:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  }
);

// Delete user
router.delete(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      // Check if user belongs to same organization
      const targetUser = await prisma.user.findUnique({ where: { id } });
      if (!targetUser || targetUser.organizationId !== req.user!.organizationId) {
        return res.status(404).json({ error: 'User not found' });
      }

      // Prevent deleting self
      if (targetUser.id === req.user!.id) {
        return res.status(400).json({ error: 'Cannot delete yourself' });
      }

      await prisma.user.delete({ where: { id } });

      res.json({ message: 'User deleted successfully' });
    } catch (error) {
      console.error('Delete user error:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
);

export { router as userRouter };

