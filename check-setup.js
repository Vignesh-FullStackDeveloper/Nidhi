#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔍 Checking Nidhi App Setup...\n');

let allGood = true;

// Check Node.js version
console.log('📦 Checking Node.js version...');
try {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.split('.')[0].substring(1));
  
  if (majorVersion >= 18) {
    console.log(`✅ Node.js ${nodeVersion} (OK)\n`);
  } else {
    console.log(`❌ Node.js ${nodeVersion} (Need v18 or higher)\n`);
    allGood = false;
  }
} catch (error) {
  console.log('❌ Could not detect Node.js version\n');
  allGood = false;
}

// Check if node_modules exist
console.log('📚 Checking dependencies...');
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (fs.existsSync(nodeModulesPath)) {
  console.log('✅ Root dependencies installed\n');
} else {
  console.log('❌ Root dependencies not installed. Run: npm install\n');
  allGood = false;
}

// Check backend setup
console.log('🔧 Checking backend setup...');
const backendPath = path.join(__dirname, 'packages', 'backend');

if (!fs.existsSync(path.join(backendPath, '.env'))) {
  console.log('⚠️  Backend .env file missing');
  console.log('   Copy .env.example to .env and configure it\n');
  allGood = false;
} else {
  console.log('✅ Backend .env exists');
  
  // Check if DATABASE_URL is configured
  const envContent = fs.readFileSync(path.join(backendPath, '.env'), 'utf-8');
  if (envContent.includes('DATABASE_URL=')) {
    console.log('✅ DATABASE_URL configured\n');
  } else {
    console.log('❌ DATABASE_URL not found in .env\n');
    allGood = false;
  }
}

// Check if Prisma client is generated
const prismaClientPath = path.join(backendPath, 'node_modules', '.prisma', 'client');
if (fs.existsSync(prismaClientPath)) {
  console.log('✅ Prisma client generated\n');
} else {
  console.log('⚠️  Prisma client not generated');
  console.log('   Run: cd packages/backend && npm run prisma:generate\n');
  allGood = false;
}

// Check web setup
console.log('🌐 Checking web setup...');
const webPath = path.join(__dirname, 'packages', 'web');

if (!fs.existsSync(path.join(webPath, '.env'))) {
  console.log('⚠️  Web .env file missing');
  console.log('   Copy .env.example to .env\n');
  allGood = false;
} else {
  console.log('✅ Web .env exists\n');
}

// Check mobile setup
console.log('📱 Checking mobile setup...');
const mobilePath = path.join(__dirname, 'packages', 'mobile');

if (!fs.existsSync(path.join(mobilePath, '.env'))) {
  console.log('⚠️  Mobile .env file missing');
  console.log('   Copy .env.example to .env\n');
  allGood = false;
} else {
  console.log('✅ Mobile .env exists\n');
}

// Check PostgreSQL (optional - not needed for Supabase)
console.log('🐘 Checking PostgreSQL...');
try {
  execSync('psql --version', { stdio: 'ignore' });
  console.log('✅ PostgreSQL is installed (local)\n');
} catch (error) {
  // PostgreSQL not required if using Supabase (cloud PostgreSQL)
  const envContent = fs.existsSync(path.join(backendPath, '.env')) 
    ? fs.readFileSync(path.join(backendPath, '.env'), 'utf-8')
    : '';
  
  if (envContent.includes('supabase') || envContent.includes('DATABASE_URL')) {
    console.log('ℹ️  PostgreSQL not installed (using cloud database like Supabase)\n');
  } else {
    console.log('⚠️  PostgreSQL not found. Install PostgreSQL or use Supabase (cloud)\n');
    // Don't fail if DATABASE_URL is configured (could be cloud database)
  }
}

// Summary
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ Setup looks good! You can start the app with:');
  console.log('   npm run dev\n');
  console.log('📖 See README.md for next steps');
} else {
  console.log('⚠️  Some issues found. Please fix them before starting.');
  console.log('\n📖 See README.md for detailed instructions');
}
console.log('='.repeat(50) + '\n');

process.exit(allGood ? 0 : 1);

