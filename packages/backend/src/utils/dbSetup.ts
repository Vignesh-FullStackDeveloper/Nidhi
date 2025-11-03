import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function ensureDatabaseSchema() {
  console.log('🔧 Checking database schema...');

  try {
    // Check if tables exist by trying a simple query
    await prisma.$queryRaw`SELECT 1 FROM "Organization" LIMIT 1`;
    console.log('✅ Database schema exists');
    
    // Check if UUID extension is enabled
    const uuidCheck = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT 1 FROM pg_extension WHERE extname = 'uuid-ossp'
      ) as has_uuid
    `;
    
    if (!uuidCheck || !(uuidCheck as any)[0].has_uuid) {
      console.log('🔧 Enabling UUID extension...');
      await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
    }
    
    // Ensure UUID defaults are set
    console.log('🔧 Ensuring UUID defaults...');
    await prisma.$executeRaw`
      ALTER TABLE "Organization" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()::text
    `;
    await prisma.$executeRaw`
      ALTER TABLE "User" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()::text
    `;
    await prisma.$executeRaw`
      ALTER TABLE "Category" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()::text
    `;
    await prisma.$executeRaw`
      ALTER TABLE "Transaction" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()::text
    `;
    await prisma.$executeRaw`
      ALTER TABLE "Attachment" ALTER COLUMN "id" SET DEFAULT uuid_generate_v4()::text
    `;
    
    console.log('✅ UUID defaults configured');
    
  } catch (error: any) {
    console.log('📦 Tables not found. Creating schema...');
    
    try {
      // Enable UUID extension
      await prisma.$executeRaw`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`;
      
      // Create all tables
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Organization" (
          "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "address" TEXT,
          "phone" TEXT,
          "email" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "Organization_name_idx" ON "Organization"("name")
      `;
      
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "User" (
          "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
          "email" TEXT UNIQUE NOT NULL,
          "password" TEXT NOT NULL,
          "firstName" TEXT NOT NULL,
          "lastName" TEXT NOT NULL,
          "phone" TEXT,
          "role" TEXT NOT NULL DEFAULT 'USER',
          "isActive" BOOLEAN NOT NULL DEFAULT true,
          "organizationId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") 
            REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email")
      `;
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "User_organizationId_idx" ON "User"("organizationId")
      `;
      
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Category" (
          "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "type" TEXT NOT NULL,
          "organizationId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Category_organizationId_fkey" FOREIGN KEY ("organizationId") 
            REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Category_name_organizationId_type_key" UNIQUE("name", "organizationId", "type")
        )
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "Category_organizationId_idx" ON "Category"("organizationId")
      `;
      
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Transaction" (
          "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
          "type" TEXT NOT NULL,
          "amount" DOUBLE PRECISION NOT NULL,
          "currency" TEXT NOT NULL DEFAULT 'INR',
          "description" TEXT NOT NULL,
          "purpose" TEXT,
          "paymentMethod" TEXT NOT NULL,
          "payerPayee" TEXT NOT NULL,
          "recipientGiver" TEXT,
          "location" TEXT,
          "transactionDate" TIMESTAMP(3) NOT NULL,
          "createdById" TEXT NOT NULL,
          "organizationId" TEXT NOT NULL,
          "categoryId" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Transaction_organizationId_fkey" FOREIGN KEY ("organizationId") 
            REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE,
          CONSTRAINT "Transaction_createdById_fkey" FOREIGN KEY ("createdById") 
            REFERENCES "User"("id") ON UPDATE CASCADE,
          CONSTRAINT "Transaction_categoryId_fkey" FOREIGN KEY ("categoryId") 
            REFERENCES "Category"("id") ON DELETE SET NULL ON UPDATE CASCADE
        )
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "Transaction_organizationId_idx" ON "Transaction"("organizationId")
      `;
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "Transaction_createdById_idx" ON "Transaction"("createdById")
      `;
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "Transaction_transactionDate_idx" ON "Transaction"("transactionDate")
      `;
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "Transaction_type_idx" ON "Transaction"("type")
      `;
      
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Attachment" (
          "id" TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::text,
          "filename" TEXT NOT NULL,
          "originalName" TEXT NOT NULL,
          "mimeType" TEXT NOT NULL,
          "size" INTEGER NOT NULL,
          "path" TEXT NOT NULL,
          "transactionId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Attachment_transactionId_fkey" FOREIGN KEY ("transactionId") 
            REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE
        )
      `;
      
      await prisma.$executeRaw`
        CREATE INDEX IF NOT EXISTS "Attachment_transactionId_idx" ON "Attachment"("transactionId")
      `;
      
      console.log('✅ Database schema created successfully!');
      
    } catch (createError: any) {
      console.error('❌ Error creating schema:', createError.message);
      throw createError;
    }
  }
}

export async function checkDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected');
    return true;
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

