
const { PrismaClient } = require('@prisma/client');
const pg = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
require('dotenv/config');

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🏗️  Inicializando Jerarquía de 4 Niveles...');

  // 1. Crear el Negocio Corporativo Maestro
  const mainBusiness = await prisma.business.upsert({
    where: { id: 'aurumfit-corp' }, // Usamos un ID fijo para la migración
    update: {},
    create: {
      id: 'aurumfit-corp',
      nombre: 'AurumFit Corporativo',
      status: 'ACTIVO',
    }
  });

  console.log('✅ Negocio Maestro creado:', mainBusiness.nombre);

  // 2. Vincular todas las sucursales existentes al negocio maestro
  const updatedGyms = await prisma.gym.updateMany({
    where: { businessId: null },
    data: { businessId: mainBusiness.id }
  });
  console.log(`✅ ${updatedGyms.count} sucursales vinculadas.`);

  // 3. Vincular todos los usuarios existentes (excepto SuperAdmins globales si fuera el caso)
  // En este modelo, los Admins actuales pasan a ser dueños de este primer negocio.
  const updatedUsers = await prisma.user.updateMany({
    where: { businessId: null, role: { not: 'SUPER_ADMIN' } },
    data: { businessId: mainBusiness.id }
  });
  console.log(`✅ ${updatedUsers.count} usuarios vinculados.`);

  // 4. Vincular Planes
  const updatedPlans = await prisma.plan.updateMany({
    where: { businessId: null },
    data: { businessId: mainBusiness.id }
  });
  console.log(`✅ ${updatedPlans.count} planes vinculados.`);

  // 5. Vincular Notificaciones
  const updatedNotifs = await prisma.notification.updateMany({
    where: { businessId: null },
    data: { businessId: mainBusiness.id }
  });
  console.log(`✅ ${updatedNotifs.count} notificaciones vinculadas.`);

  // 6. Configurar SystemSettings para el negocio
  // Buscamos si hay settings huérfanos (el que era "default")
  const oldSettings = await prisma.systemSettings.findFirst({
      where: { businessId: null }
  });

  if (oldSettings) {
      await prisma.systemSettings.update({
          where: { id: oldSettings.id },
          data: { businessId: mainBusiness.id }
      });
      console.log('✅ Configuración de sistema vinculada al negocio maestro.');
  } else {
      await prisma.systemSettings.create({
          data: {
              businessId: mainBusiness.id,
              gymName: 'AurumFit Corp',
              primaryColor: '#00695c',
              darkMode: true
          }
      });
      console.log('✅ Nueva configuración de sistema creada para el negocio maestro.');
  }

  console.log('✨ Migración de Jerarquía completada con éxito.');
}

main()
  .catch(e => console.error('❌ Error en migración:', e))
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
