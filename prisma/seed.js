
import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding database with AurumFit dummy data...');

  // 1. Create Gyms
  const gym1 = await prisma.gym.upsert({
    where: { id: 'gym-1' },
    update: {},
    create: {
      id: 'gym-1',
      nombre: 'AurumFit Polanco',
      direccion: 'Av. Presidente Masaryk 123, CDMX',
      cancellationWindow: 2
    }
  });

  const gym2 = await prisma.gym.upsert({
    where: { id: 'gym-2' },
    update: {},
    create: {
      id: 'gym-2',
      nombre: 'AurumFit Santa Fe',
      direccion: 'Vasco de Quiroga 456, CDMX',
      cancellationWindow: 4
    }
  });

  console.log('✅ Gyms created:', gym1.nombre, ',', gym2.nombre);

  // 2. Find or Create an Instructor
  let instructor = await prisma.user.findFirst({
    where: { role: 'INSTRUCTOR' }
  });

  if (!instructor) {
     instructor = await prisma.user.create({
        data: {
          nombre: 'Coach Legend',
          email: 'coach@aurumfit.mx',
          password: 'pass', // Just for demo
          role: 'INSTRUCTOR',
          foto: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=200&h=200&auto=format&fit=crop'
        }
     });
  }

  console.log('✅ Instructor verified:', instructor.nombre);

  // 3. Create Classes (avoid duplicates for demo)
  const existingClasses = await prisma.class.count();
  if (existingClasses === 0) {
    const classesData = [
      {
        nombre: 'Power Lifting Elite',
        categoria: 'PESAS',
        instructorId: instructor.id,
        gymId: gym1.id,
        diaSemana: 1, // Lunes
        horaInicio: '08:00',
        horaFin: '09:00',
        capacidad: 15
      },
      {
        nombre: 'Yoga Zen Flow',
        categoria: 'YOGA',
        instructorId: instructor.id,
        gymId: gym2.id,
        diaSemana: 2, // Martes
        horaInicio: '18:00',
        horaFin: '19:30',
        capacidad: 20
      },
      {
        nombre: 'Spin Warriors',
        categoria: 'SPIN',
        instructorId: instructor.id,
        gymId: gym1.id,
        diaSemana: 3, // Miércoles
        horaInicio: '07:00',
        horaFin: '08:00',
        capacidad: 25
      },
      {
        nombre: 'Box Pro',
        categoria: 'BOX',
        instructorId: instructor.id,
        gymId: gym2.id,
        diaSemana: 4, // Jueves
        horaInicio: '19:00',
        horaFin: '20:30',
        capacidad: 12
      },
      {
        nombre: 'Pilates Reformer',
        categoria: 'PILATES',
        instructorId: instructor.id,
        gymId: gym1.id,
        diaSemana: 5, // Viernes
        horaInicio: '10:00',
        horaFin: '11:00',
        capacidad: 8
      }
    ];

    for (const c of classesData) {
      await prisma.class.create({ data: c });
    }
    console.log('✅ Classes created.');
  } else {
    console.log('ℹ️ Classes already exist skipping class creation.');
  }

  console.log('✨ Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
