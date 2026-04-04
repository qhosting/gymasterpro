
const { PrismaClient } = require('@prisma/client');
const pg = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const bcrypt = require('bcryptjs');
require('dotenv/config');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hash = bcrypt.hashSync('pass', 10);
  const adminHash = bcrypt.hashSync('admin123', 10);

  console.log('🔄 Actualizando contraseñas para AurumFit...');

  // Update or Create Instructor
  await prisma.user.upsert({
    where: { email: 'coach@aurumfit.mx' },
    update: { password: hash },
    create: {
      nombre: 'Coach Legend',
      email: 'coach@aurumfit.mx',
      password: hash,
      role: 'INSTRUCTOR',
      foto: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200&h=200&auto=format&fit=crop'
    }
  });

  // Update or Create Admin
  await prisma.user.upsert({
    where: { email: 'admin@aurumfit.com' },
    update: { password: adminHash },
    create: {
      nombre: 'Rodrigo Master',
      email: 'admin@aurumfit.com',
      password: adminHash,
      role: 'ADMIN'
    }
  });

  // Update or Create Member
  await prisma.user.upsert({
    where: { email: 'juan@demo.com' },
    update: { password: hash },
    create: {
      nombre: 'Juan Pérez',
      email: 'juan@demo.com',
      password: hash,
      role: 'MIEMBRO'
    }
  });

  console.log('✅ Credenciales actualizadas correctamente:');
  console.log('-------------------------------------------');
  console.log('Instructor: coach@aurumfit.mx / pass');
  console.log('Admin:      admin@aurumfit.com / admin123');
  console.log('Miembro:    juan@demo.com      / pass');
  console.log('-------------------------------------------');
}

main()
  .catch(e => console.error('❌ Error:', e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
