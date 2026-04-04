
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Final Data Sync: Multi-Tenant 4 Levels ---');

  // 1. Get or Create Corporate Business
  let business = await prisma.business.findFirst({
    where: { nombre: 'AurumFit Corporativo' }
  });

  if (!business) {
    business = await prisma.business.create({
      data: {
        nombre: 'AurumFit Corporativo',
        logo: 'https://aurumfit.com/logo.png',
        status: 'ACTIVO'
      }
    });
  }
  console.log('✅ Corporate Business ready:', business.id);

  // 2. Link Admin User
  const adminEmail = 'admin@aurumfit.com';
  const admin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (admin) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { businessId: business.id }
    });
    console.log('✅ Admin linked to Corporate Business.');
  }

  // 3. Upsert System Settings
  await prisma.systemSettings.upsert({
    where: { businessId: business.id },
    update: { 
      appName: 'AurumFit Corp',
      primaryColor: '#00695c'
    },
    create: {
      businessId: business.id,
      geminiKey: process.env.GEMINI_API_KEY || 'AI_READY',
      whatsappToken: 'AURUM_CORP_TOKEN',
      appName: 'AurumFit Corp',
      primaryColor: '#00695c'
    }
  });
  console.log('✅ System Settings synchronized.');

  console.log('--- Hierarchy Sync Completed ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
