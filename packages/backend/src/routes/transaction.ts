import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import { PrismaClient } from '@prisma/client';
import { authenticate, authorize, AuthRequest } from '../middleware/auth';
import { upload } from '../middleware/upload';

const router = Router();
const prisma = new PrismaClient();

// Get all transactions
router.get('/', authenticate, async (req: AuthRequest, res) => {
  try {
    const { type, startDate, endDate, page = '1', limit = '50' } = req.query;

    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);

    const where: any = {
      organizationId: req.user!.organizationId
    };

    if (type) {
      where.type = type;
    }

    if (startDate || endDate) {
      where.transactionDate = {};
      if (startDate) {
        where.transactionDate.gte = new Date(startDate as string);
      }
      if (endDate) {
        where.transactionDate.lte = new Date(endDate as string);
      }
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          attachments: true
        },
        orderBy: { transactionDate: 'desc' },
        skip,
        take: parseInt(limit as string)
      }),
      prisma.transaction.count({ where })
    ]);

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        pages: Math.ceil(total / parseInt(limit as string))
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
});

// Get single transaction
router.get('/:id', authenticate, async (req: AuthRequest, res) => {
  try {
    const { id } = req.params;

    const transaction = await prisma.transaction.findFirst({
      where: {
        id,
        organizationId: req.user!.organizationId
      },
      include: {
        category: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        attachments: true
      }
    });

    if (!transaction) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(transaction);
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: 'Failed to get transaction' });
  }
});

// Create transaction
router.post(
  '/',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'USER'),
  upload.array('attachments', 5),
  [
    body('type').isIn(['INCOME', 'EXPENSE']),
    body('amount').isFloat({ min: 0 }),
    body('currency').isIn(['USD', 'EUR', 'GBP', 'INR', 'JPY', 'CNY', 'AUD', 'CAD', 'OTHER']),
    body('description').notEmpty(),
    body('paymentMethod').isIn(['CASH', 'CHEQUE', 'DD', 'BANK_TRANSFER', 'CARD', 'UPI', 'OTHER']),
    body('payerPayee').notEmpty(),
    body('transactionDate').isISO8601()
  ],
  async (req: AuthRequest, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const {
        type,
        amount,
        currency,
        description,
        purpose,
        paymentMethod,
        payerPayee,
        recipientGiver,
        location,
        transactionDate,
        categoryId
      } = req.body;

      const files = req.files as Express.Multer.File[];

      const transaction = await prisma.transaction.create({
        data: {
          type,
          amount: parseFloat(amount),
          currency,
          description,
          purpose,
          paymentMethod,
          payerPayee,
          recipientGiver,
          location,
          transactionDate: new Date(transactionDate),
          organizationId: req.user!.organizationId,
          createdById: req.user!.id,
          categoryId: categoryId || null,
          attachments: files && files.length > 0
            ? {
                create: files.map(file => {
                  // For memory storage (Vercel), file.path is undefined
                  // Use a placeholder path or upload to cloud storage
                  const filePath = file.path || `/uploads/${file.filename || 'temp-' + Date.now()}`;
                  return {
                    filename: file.filename || file.originalname,
                    originalName: file.originalname,
                    mimeType: file.mimetype,
                    size: file.size,
                    path: filePath
                  };
                })
              }
            : undefined
        },
        include: {
          category: true,
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          attachments: true
        }
      });

      res.status(201).json(transaction);
    } catch (error) {
      console.error('Create transaction error:', error);
      res.status(500).json({ error: 'Failed to create transaction' });
    }
  }
);

// Update transaction
router.put(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN', 'USER'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;
      const {
        amount,
        currency,
        description,
        purpose,
        paymentMethod,
        payerPayee,
        recipientGiver,
        location,
        transactionDate,
        categoryId
      } = req.body;

      // Check if transaction belongs to same organization
      const targetTransaction = await prisma.transaction.findFirst({
        where: {
          id,
          organizationId: req.user!.organizationId
        }
      });

      if (!targetTransaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      const transaction = await prisma.transaction.update({
        where: { id },
        data: {
          amount: amount ? parseFloat(amount) : undefined,
          currency,
          description,
          purpose,
          paymentMethod,
          payerPayee,
          recipientGiver,
          location,
          transactionDate: transactionDate ? new Date(transactionDate) : undefined,
          categoryId: categoryId || null
        },
        include: {
          category: true,
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          attachments: true
        }
      });

      res.json(transaction);
    } catch (error) {
      console.error('Update transaction error:', error);
      res.status(500).json({ error: 'Failed to update transaction' });
    }
  }
);

// Delete transaction
router.delete(
  '/:id',
  authenticate,
  authorize('SUPER_ADMIN', 'ADMIN'),
  async (req: AuthRequest, res) => {
    try {
      const { id } = req.params;

      // Check if transaction belongs to same organization
      const targetTransaction = await prisma.transaction.findFirst({
        where: {
          id,
          organizationId: req.user!.organizationId
        }
      });

      if (!targetTransaction) {
        return res.status(404).json({ error: 'Transaction not found' });
      }

      await prisma.transaction.delete({ where: { id } });

      res.json({ message: 'Transaction deleted successfully' });
    } catch (error) {
      console.error('Delete transaction error:', error);
      res.status(500).json({ error: 'Failed to delete transaction' });
    }
  }
);

export { router as transactionRouter };

