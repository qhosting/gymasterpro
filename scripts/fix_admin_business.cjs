
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Fixing SuperAdmin BusinessId ---');
  
  // 1. Find or create the corporate business
  let business = await prisma.business.findFirst({
    where: { nombre: 'AurumFit Corporativo' }
  });
  
  if (!business) {
    console.log('Creating corporate business...');
    business = await prisma.business.create({
      data: {
        nombre: 'AurumFit Corporativo',
        logo: 'https://aurumfit.com/logo.png',
        status: 'ACTIVO'
      }
    });
  }
  
  console.log('Corporate Business ID:', business.id);
  
  // 2. Link the SuperAdmin
  const admin = await prisma.user.findUnique({
    where: { email: 'admin@aurumfit.com' }
  });
  
  if (admin) {
    if (!admin.businessId) {
       await prisma.user.update({
         where: { id: admin.id },
         data: { businessId: business.id }
       });
       console.log('Linked admin@aurumfit.com to corporate business.');
    } else {
       console.log('admin@aurumfit.com already has businessId:', admin.businessId);
    }
  } else {
    console.log('SuperAdmin admin@aurumfit.com not found.');
  }

  // 3. Ensure SystemSettings exist for this business
  const settings = await prisma.systemSettings.findUnique({
    where: { businessId: business.id }
  });
  
  if (!settings) {
    console.log('Creating SystemSettings for corporate business...');
    await prisma.systemSettings.create({
      data: {
        businessId: business.id,
        geminiKey: process.env.GEMINI_API_KEY || 'YOUR_GEMINI_KEY_HERE',
        whatsappToken: 'AURUM_CORP_WA_TOKEN',
        appName: 'AurumFit Corp',
        primaryColor: '#00695c'
      }
    });
  }

  console.log('--- Done ---');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
