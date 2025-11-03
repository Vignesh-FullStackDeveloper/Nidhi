import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns';
import PDFDocument from 'pdfkit';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';

const router = Router();
const prisma = new PrismaClient();

// Get summary report
router.get('/summary', authenticate, async (req: AuthRequest, res) => {
  try {
    const { period = 'month', date } = req.query;
    const referenceDate = date ? new Date(date as string) : new Date();

    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'week':
        startDate = startOfWeek(referenceDate, { weekStartsOn: 1 });
        endDate = endOfWeek(referenceDate, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(referenceDate);
        endDate = endOfMonth(referenceDate);
        break;
      case 'year':
        startDate = startOfYear(referenceDate);
        endDate = endOfYear(referenceDate);
        break;
      default:
        startDate = startOfMonth(referenceDate);
        endDate = endOfMonth(referenceDate);
    }

    const where = {
      organizationId: req.user!.organizationId,
      transactionDate: {
        gte: startDate,
        lte: endDate
      }
    };

    const [income, expenses, transactions] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true },
        _count: true
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true },
        _count: true
      }),
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
          createdBy: {
            select: {
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: { transactionDate: 'desc' }
      })
    ]);

    // Group by category
    const categoryBreakdown = transactions.reduce((acc: any, transaction) => {
      const categoryName = transaction.category?.name || 'Uncategorized';
      if (!acc[transaction.type]) {
        acc[transaction.type] = {};
      }
      if (!acc[transaction.type][categoryName]) {
        acc[transaction.type][categoryName] = {
          total: 0,
          count: 0,
          transactions: []
        };
      }
      acc[transaction.type][categoryName].total += transaction.amount;
      acc[transaction.type][categoryName].count += 1;
      acc[transaction.type][categoryName].transactions.push(transaction);
      return acc;
    }, {});

    const totalIncome = income._sum.amount || 0;
    const totalExpenses = expenses._sum.amount || 0;
    const balance = totalIncome - totalExpenses;

    res.json({
      period: {
        type: period,
        startDate,
        endDate
      },
      summary: {
        totalIncome,
        totalExpenses,
        balance,
        incomeCount: income._count,
        expenseCount: expenses._count
      },
      categoryBreakdown,
      transactions
    });
  } catch (error) {
    console.error('Get report error:', error);
    res.status(500).json({ error: 'Failed to get report' });
  }
});

// Download PDF report
router.get('/download', authenticate, async (req: AuthRequest, res) => {
  try {
    const { period = 'month', date } = req.query;
    const referenceDate = date ? new Date(date as string) : new Date();

    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'week':
        startDate = startOfWeek(referenceDate, { weekStartsOn: 1 });
        endDate = endOfWeek(referenceDate, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(referenceDate);
        endDate = endOfMonth(referenceDate);
        break;
      case 'year':
        startDate = startOfYear(referenceDate);
        endDate = endOfYear(referenceDate);
        break;
      default:
        startDate = startOfMonth(referenceDate);
        endDate = endOfMonth(referenceDate);
    }

    const where = {
      organizationId: req.user!.organizationId,
      transactionDate: {
        gte: startDate,
        lte: endDate
      }
    };

    const [income, expenses, transactions, organization] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true }
      }),
      prisma.transaction.findMany({
        where,
        include: {
          category: true
        },
        orderBy: { transactionDate: 'desc' }
      }),
      prisma.organization.findUnique({
        where: { id: req.user!.organizationId }
      })
    ]);

    const totalIncome = income._sum.amount || 0;
    const totalExpenses = expenses._sum.amount || 0;
    const balance = totalIncome - totalExpenses;

    // Create PDF
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=report-${period}-${referenceDate.toISOString().split('T')[0]}.pdf`
    );
    doc.pipe(res);

    // Header
    doc.fontSize(20).text(organization?.name || 'Organization', { align: 'center' });
    doc.fontSize(16).text('Financial Report', { align: 'center' });
    doc.fontSize(12).text(`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, {
      align: 'center'
    });
    doc.moveDown(2);

    // Summary
    doc.fontSize(14).text('Summary', { underline: true });
    doc.fontSize(11);
    doc.text(`Total Income: ${totalIncome.toFixed(2)}`);
    doc.text(`Total Expenses: ${totalExpenses.toFixed(2)}`);
    doc.text(`Balance: ${balance.toFixed(2)}`);
    doc.moveDown(2);

    // Transactions
    doc.fontSize(14).text('Transactions', { underline: true });
    doc.fontSize(10);

    transactions.forEach((transaction) => {
      doc.text(
        `${transaction.transactionDate.toLocaleDateString()} | ${transaction.type} | ${
          transaction.description
        } | ${transaction.amount.toFixed(2)} ${transaction.currency}`
      );
    });

    doc.end();
  } catch (error) {
    console.error('Download report error:', error);
    res.status(500).json({ error: 'Failed to download report' });
  }
});

// Helper function to generate PDF
async function generatePDFReport(
  organization: any,
  transactions: any[],
  totalIncome: number,
  totalExpenses: number,
  balance: number,
  startDate: Date,
  endDate: Date
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on('error', reject);

    // Header
    doc.fontSize(20).text(organization?.name || 'Organization', { align: 'center' });
    doc.fontSize(16).text('Financial Report', { align: 'center' });
    doc.fontSize(12).text(`Period: ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`, {
      align: 'center'
    });
    doc.moveDown(2);

    // Summary
    doc.fontSize(14).text('Summary', { underline: true });
    doc.fontSize(11);
    doc.text(`Total Income: ${totalIncome.toFixed(2)}`);
    doc.text(`Total Expenses: ${totalExpenses.toFixed(2)}`);
    doc.text(`Balance: ${balance.toFixed(2)}`);
    doc.moveDown(2);

    // Transactions
    doc.fontSize(14).text('Transactions', { underline: true });
    doc.fontSize(10);

    transactions.forEach((transaction) => {
      doc.text(
        `${transaction.transactionDate.toLocaleDateString()} | ${transaction.type} | ${
          transaction.description
        } | ${transaction.amount.toFixed(2)} ${transaction.currency}`
      );
    });

    doc.end();
  });
}

// Email report with PDF attachment
router.post('/email', authenticate, async (req: AuthRequest, res) => {
  try {
    const { email, period = 'month', date } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const referenceDate = date ? new Date(date) : new Date();

    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case 'week':
        startDate = startOfWeek(referenceDate, { weekStartsOn: 1 });
        endDate = endOfWeek(referenceDate, { weekStartsOn: 1 });
        break;
      case 'month':
        startDate = startOfMonth(referenceDate);
        endDate = endOfMonth(referenceDate);
        break;
      case 'year':
        startDate = startOfYear(referenceDate);
        endDate = endOfYear(referenceDate);
        break;
      default:
        startDate = startOfMonth(referenceDate);
        endDate = endOfMonth(referenceDate);
    }

    const where = {
      organizationId: req.user!.organizationId,
      transactionDate: {
        gte: startDate,
        lte: endDate
      }
    };

    // Fetch all data needed for PDF
    const [income, expenses, transactions, organization] = await Promise.all([
      prisma.transaction.aggregate({
        where: { ...where, type: 'INCOME' },
        _sum: { amount: true }
      }),
      prisma.transaction.aggregate({
        where: { ...where, type: 'EXPENSE' },
        _sum: { amount: true }
      }),
      prisma.transaction.findMany({
        where,
        include: {
          category: true
        },
        orderBy: { transactionDate: 'desc' }
      }),
      prisma.organization.findUnique({
        where: { id: req.user!.organizationId }
      })
    ]);

    const totalIncome = income._sum.amount || 0;
    const totalExpenses = expenses._sum.amount || 0;
    const balance = totalIncome - totalExpenses;

    // Generate PDF
    const pdfBuffer = await generatePDFReport(
      organization,
      transactions,
      totalIncome,
      totalExpenses,
      balance,
      startDate,
      endDate
    );

    const filename = `report-${period}-${referenceDate.toISOString().split('T')[0]}.pdf`;
    const subject = `Financial Report - ${period.charAt(0).toUpperCase() + period.slice(1)} - ${referenceDate.toLocaleDateString()}`;
    const htmlContent = `
      <h2>Financial Report</h2>
      <p><strong>Organization:</strong> ${organization?.name || 'N/A'}</p>
      <p><strong>Period:</strong> ${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}</p>
      <h3>Summary</h3>
      <ul>
        <li><strong>Total Income:</strong> ₹${totalIncome.toFixed(2)}</li>
        <li><strong>Total Expenses:</strong> ₹${totalExpenses.toFixed(2)}</li>
        <li><strong>Balance:</strong> ₹${balance.toFixed(2)}</li>
      </ul>
      <p>Please find the detailed PDF report attached.</p>
      <p>For more details, please login to the application.</p>
    `;

    // Check which email service to use
    const hasResend = !!process.env.RESEND_API_KEY;
    const hasSMTP = !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);

    if (hasResend) {
      // Use Resend API (easiest - just API key)
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      await resend.emails.send({
        from: process.env.EMAIL_FROM || 'onboarding@resend.dev',
        to: email,
        subject: subject,
        html: htmlContent,
        attachments: [
          {
            filename: filename,
            content: pdfBuffer.toString('base64'),
            content_type: 'application/pdf'
          } as any
        ]
      });
    } else if (hasSMTP) {
      // Use SMTP (nodemailer)
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });

      await transporter.sendMail({
        from: process.env.EMAIL_FROM || process.env.SMTP_USER,
        to: email,
        subject: subject,
        html: htmlContent,
        attachments: [
          {
            filename: filename,
            content: pdfBuffer,
            contentType: 'application/pdf'
          }
        ]
      });
    } else {
      // No email service configured - return PDF as download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
      return res.send(pdfBuffer);
    }

    res.json({ message: 'Report sent successfully' });
  } catch (error: any) {
    console.error('Email report error:', error);
    res.status(500).json({ 
      error: 'Failed to send report',
      details: error.message || 'Unknown error occurred'
    });
  }
});

export { router as reportRouter };

