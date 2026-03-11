import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('Seeding database with Prisma 7 Adapter...');
    
    // 1. Create Plans
    const plans = [
        { 
            id: '1', 
            nombre: 'Plan Básico', 
            costo: 350, 
            duracionMeses: 1, 
            beneficios: ['Acceso Gimnasio', 'App Móvil'],
            color: 'bg-blue-500'
        },
        { 
            id: '2', 
            nombre: 'Plan Premium', 
            costo: 800, 
            duracionMeses: 3, 
            beneficios: ['Acceso Total', 'Instructor Personal', 'Invitado Gratis'],
            color: 'bg-orange-500'
        },
        { 
            id: '3', 
            nombre: 'Plan Anual', 
            costo: 2800, 
            duracionMeses: 12, 
            beneficios: ['Acceso Total', '2 Meses Gratis', 'Evaluación Médica'],
            color: 'bg-emerald-500'
        },
    ];

    for (const plan of plans) {
        await prisma.plan.upsert({
            where: { id: plan.id },
            update: plan,
            create: plan,
        });
    }
    console.log('Plans seeded');

    // 2. Create Admin User
    const hashedAdminPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await prisma.user.upsert({
        where: { email: 'admin@gymmaster.com' },
        update: { password: hashedAdminPassword },
        create: {
            id: 'admin-1',
            nombre: 'Super Admin',
            email: 'admin@gymmaster.com',
            password: hashedAdminPassword,
            role: 'SUPER_ADMIN',
            foto: 'https://picsum.photos/seed/admin/100/100'
        }
    });
    console.log('Admin user seeded');

    // 3. Create Sample Members
    const hashedMemberPassword = await bcrypt.hash('socio123', 10);
    const membersData = [
        {
            id: 'm1',
            nombre: 'Juan Pérez',
            email: 'juan@example.com',
            password: hashedMemberPassword,
            role: 'MIEMBRO',
            foto: 'https://picsum.photos/seed/juan/100/100',
            memberInfo: {
                fechaVencimiento: new Date('2024-06-15'),
                planId: '1',
                status: 'ACTIVO',
                deuda: 0,
                fechaNacimiento: new Date('1990-05-12'),
                contactoEmergencia: 'Esposa - Ana',
                telefonoEmergencia: '5511223344',
                objetivo: 'Pérdida de peso',
            }
        },
        {
            id: 'm2',
            nombre: 'Maria García',
            email: 'maria@example.com',
            password: hashedMemberPassword,
            role: 'MIEMBRO',
            foto: 'https://picsum.photos/seed/maria/100/100',
            memberInfo: {
                fechaVencimiento: new Date('2024-07-10'),
                planId: '2',
                status: 'ACTIVO',
                deuda: 0,
                fechaNacimiento: new Date('1985-11-20'),
                contactoEmergencia: 'Hermano - Luis',
                telefonoEmergencia: '5544332211',
                objetivo: 'Hipertrofia',
            }
        }
    ];

    for (const data of membersData) {
        const { memberInfo, id, ...userData } = data;
        const user = await prisma.user.upsert({
            where: { email: userData.email },
            update: userData,
            create: { id, ...userData }
        });
        
        await prisma.member.upsert({
            where: { id: user.id },
            update: memberInfo,
            create: {
                id: user.id,
                ...memberInfo
            }
        });
    }
    console.log('Members seeded');

    // 4. Create Body Metrics
    await prisma.bodyMetrics.createMany({
        data: [
            { 
                memberId: 'm1', 
                peso: 85.5, 
                masaMuscular: 32.2, 
                grasaCorporal: 25.5, 
                agua: 55.4, 
                imc: 28.2,
                fecha: new Date('2024-01-10')
            },
            { 
                memberId: 'm1', 
                peso: 83.2, 
                masaMuscular: 33.5, 
                grasaCorporal: 23.8, 
                agua: 57.1, 
                imc: 27.5,
                fecha: new Date('2024-02-12')
            },
            { 
                memberId: 'm1', 
                peso: 81.5, 
                masaMuscular: 35.0, 
                grasaCorporal: 21.5, 
                agua: 59.2, 
                imc: 26.8,
                fecha: new Date('2024-03-15')
            },
        ]
    });
    console.log('Metrics seeded');

    // 5. Create Appointments
    await prisma.appointment.createMany({
        data: [
            {
                memberId: 'm1',
                fecha: new Date('2024-06-20'),
                hora: '10:00',
                status: 'Programada'
            },
            {
                memberId: 'm2',
                fecha: new Date('2024-06-22'),
                hora: '11:30',
                status: 'Programada'
            }
        ]
    });
    console.log('Appointments seeded');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
