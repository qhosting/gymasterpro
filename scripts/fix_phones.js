
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('--- REVISANDO POSIBLES DUPLICADOS O STRINGS VACÍOS ---');
  
  const users = await prisma.user.findMany({
    select: {
      id: true,
      nombre: true,
      email: true,
      telefono: true
    }
  });

  console.log('Usuarios en BD:', users.length);
  
  const emptyPhones = users.filter(u => u.telefono === '');
  console.log('Usuarios con teléfono "" (string vacío):', emptyPhones.length);
  
  if (emptyPhones.length > 0) {
    console.log('Corrigiendo strings vacíos a NULL...');
    for (const user of emptyPhones) {
      try {
        await prisma.user.update({
          where: { id: user.id },
          data: { telefono: null }
        });
        console.log(`- Corregido: ${user.nombre}`);
      } catch (err) {
        console.log(`- Error corrigiendo ${user.nombre}: ${err.message}`);
      }
    }
  }

  // Buscar duplicados reales
  const phones = users.map(u => u.telefono).filter(p => p !== null && p !== '');
  const duplicates = phones.filter((item, index) => phones.indexOf(item) !== index);
  
  if (duplicates.length > 0) {
    console.warn('⚠️ TELÉFONOS DUPLICADOS DETECTADOS EN LA BD:', [...new Set(duplicates)]);
    
    // Listar quiénes son los duplicados
    for (const phone of [...new Set(duplicates)]) {
        const owners = users.filter(u => u.telefono === phone);
        console.log(`- El teléfono ${phone} le pertenece a: ${owners.map(o => o.nombre).join(' y ')}`);
    }
  } else {
    console.log('✅ No hay teléfonos duplicados reales en la BD.');
  }

  console.log('--- FIN DE LA REVISIÓN ---');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
