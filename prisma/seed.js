import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    console.log('🚀 Iniciando Super Seed para Demo Real (Datos persistentes)...');
    
    // Clear existing data (optional but good for a fresh start in demo)
    console.log('🧹 Limpiando base de datos...');
    await prisma.notification.deleteMany({});
    await prisma.exercise.deleteMany({});
    await prisma.routine.deleteMany({});
    await prisma.appointment.deleteMany({});
    await prisma.bodyMetrics.deleteMany({});
    await prisma.attendance.deleteMany({});
    await prisma.transaction.deleteMany({});
    await prisma.member.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.plan.deleteMany({});
    await prisma.systemSettings.deleteMany({});

    // 1. Configuración del Sistema
    console.log('⚙️ Configurando ajustes del sistema...');
    await prisma.systemSettings.create({
        data: {
            id: 'default',
            gymName: 'GymMaster Pro Elite',
            aforoMaximo: 60,
            direccion: 'Av. Paseo de la Reforma 123, CDMX',
            horario: '6:00 AM - 11:00 PM',
            geminiKey: process.env.GEMINI_API_KEY || '',
            wahaUrl: 'http://localhost:3000',
            pushEnabled: true
        }
    });

    // 2. Planes de Gimnasio
    console.log('📋 Creando planes...');
    const plans = [
        { id: 'p1', nombre: 'Plan Mensual Básico', costo: 450, duracionMeses: 1, beneficios: ['Pesas', 'Cardio', 'App'], color: 'bg-blue-500' },
        { id: 'p2', nombre: 'Semestre Premium', costo: 2400, duracionMeses: 6, beneficios: ['Acceso 24/7', 'Nutrición', 'Sauna', 'Invitados'], color: 'bg-orange-500' },
        { id: 'p3', nombre: 'Anualidad Black', costo: 4200, duracionMeses: 12, beneficios: ['Todo Incluido', 'Estacionamiento', 'Crossfit', 'Ropa Gym'], color: 'bg-black' }
    ];
    for (const p of plans) await prisma.plan.create({ data: p });

    // 3. Usuarios de Staff
    console.log('👮 Creando staff...');
    const hashedPass = await bcrypt.hash('admin123', 10);
    await prisma.user.create({
        data: {
            id: 'admin-1',
            nombre: 'Rodrigo Master',
            email: 'admin@gymaster.com',
            password: hashedPass,
            role: 'SUPER_ADMIN',
            foto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop'
        }
    });
    
    const hashedNutri = await bcrypt.hash('nutri123', 10);
    await prisma.user.create({
        data: {
            id: 'nutri-1',
            nombre: 'Lic. Sofía Nutrición',
            email: 'nutri@gymaster.com',
            password: hashedNutri,
            role: 'NUTRIOLOGO',
            foto: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop'
        }
    });

    // 4. Miembros (10 miembros para que la tabla se vea llena)
    console.log('👥 Creando 10 socios reales...');
    const membersData = [
        { id: 'm1', nombre: 'Juan Pérez', email: 'juan@demo.com', status: 'ACTIVO', planId: 'p1', foto: 'https://i.pravatar.cc/150?u=m1' },
        { id: 'm2', nombre: 'Karla Gómez', email: 'karla@demo.com', status: 'ACTIVO', planId: 'p2', foto: 'https://i.pravatar.cc/150?u=m2' },
        { id: 'm3', nombre: 'Roberto Soto', email: 'roberto@demo.com', status: 'VENCIDO', planId: 'p1', foto: 'https://i.pravatar.cc/150?u=m3' },
        { id: 'm4', nombre: 'Elena Rivas', email: 'elena@demo.com', status: 'ACTIVO', planId: 'p3', foto: 'https://i.pravatar.cc/150?u=m4' },
        { id: 'm5', nombre: 'Miguel Angel', email: 'miguel@demo.com', status: 'PENDIENTE', planId: 'p1', foto: 'https://i.pravatar.cc/150?u=m5' },
        { id: 'm6', nombre: 'Lucía Méndez', email: 'lucia@demo.com', status: 'ACTIVO', planId: 'p2', foto: 'https://i.pravatar.cc/150?u=m6' },
        { id: 'm7', nombre: 'Fernando Paz', email: 'fer@demo.com', status: 'ACTIVO', planId: 'p1', foto: 'https://i.pravatar.cc/150?u=m7' },
        { id: 'm8', nombre: 'Patricia Luna', email: 'paty@demo.com', status: 'VENCIDO', planId: 'p1', foto: 'https://i.pravatar.cc/150?u=m8' },
        { id: 'm9', nombre: 'David Silva', email: 'david@demo.com', status: 'ACTIVO', planId: 'p2', foto: 'https://i.pravatar.cc/150?u=m9' },
        { id: 'm10', nombre: 'Sandra Bullock', email: 'sandra@demo.com', status: 'ACTIVO', planId: 'p3', foto: 'https://i.pravatar.cc/150?u=m10' },
    ];

    const socioPass = await bcrypt.hash('socio123', 10);
    const today = new Date();

    for (const m of membersData) {
        const user = await prisma.user.create({
            data: {
                id: m.id,
                nombre: m.nombre,
                email: m.email,
                password: socioPass,
                role: 'MIEMBRO',
                foto: m.foto,
                telefono: '521' + Math.floor(Math.random() * 9000000000 + 1000000000).toString()
            }
        });

        const vencimiento = new Date();
        vencimiento.setDate(today.getDate() + (m.status === 'VENCIDO' ? -5 : 25));

        await prisma.member.create({
            data: {
                id: user.id,
                planId: m.planId,
                status: m.status,
                fechaVencimiento: vencimiento,
                deuda: m.status === 'VENCIDO' ? 450 : 0,
                objetivo: 'Mejorar condición física',
                puntosComunidad: Math.floor(Math.random() * 1000),
                rachaDias: Math.floor(Math.random() * 15)
            }
        });
    }

    // 5. Historial de Asistencia (Últimos 14 días)
    console.log('📉 Generando historial de asistencia (14 días)...');
    for (let i = 14; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        
        // Aleatoriamente 3-7 personas por día
        const numCheckins = Math.floor(Math.random() * 5) + 3;
        const selectedMembers = membersData.sort(() => 0.5 - Math.random()).slice(0, numCheckins);
        
        for (const sm of selectedMembers) {
            const entryTime = new Date(date);
            entryTime.setHours(Math.floor(Math.random() * 12) + 7, Math.floor(Math.random() * 60)); // Entre 7am y 7pm
            
            const exitTime = new Date(entryTime);
            exitTime.setHours(entryTime.getHours() + 1, entryTime.getMinutes() + Math.floor(Math.random() * 30));

            await prisma.attendance.create({
                data: {
                    memberId: sm.id,
                    entrada: entryTime,
                    salida: i === 0 && Math.random() > 0.5 ? null : exitTime // Algunos siguen en el gym hoy
                }
            });
        }
    }

    // 6. Transacciones Reales (Ingresos)
    console.log('💰 Generando flujo de caja (3 meses)...');
    const methods = ['Efectivo', 'Tarjeta', 'Transferencia'];
    for (let i = 0; i < 20; i++) {
        const tDate = new Date();
        tDate.setDate(today.getDate() - Math.floor(Math.random() * 90));
        const randomMember = membersData[Math.floor(Math.random() * membersData.length)];
        
        await prisma.transaction.create({
            data: {
                memberId: randomMember.id,
                monto: [450, 2400, 4200][Math.floor(Math.random() * 3)],
                fecha: tDate,
                metodo: methods[Math.floor(Math.random() * 3)],
                tipo: 'Mensualidad',
                status: 'Completado'
            }
        });
    }

    // 7. Métricas de Salud (Evolución para m1 y m2)
    console.log('⚖️ Creando métricas de evolución bruta...');
    const healthData = [
        { mid: 'm1', peso: [85, 83, 81], grasa: [25, 24, 22] },
        { mid: 'm2', peso: [65, 64, 63], grasa: [28, 27, 26] }
    ];
    for (const h of healthData) {
        for (let i = 0; i < 3; i++) {
            const hDate = new Date();
            hDate.setMonth(today.getMonth() - (2 - i));
            await prisma.bodyMetrics.create({
                data: {
                    memberId: h.mid,
                    fecha: hDate,
                    peso: h.peso[i],
                    grasaCorporal: h.grasa[i],
                    masaMuscular: 30 + i,
                    agua: 55 + i,
                    imc: h.peso[i] / (1.75 * 1.75)
                }
            });
        }
    }

    // 8. Rutinas de ejemplo
    console.log('🏋️ Asignando rutinas...');
    const routine = await prisma.routine.create({
        data: {
            memberId: 'm1',
            nombre: 'Push Day (Empuje)',
            descripcion: 'Enfocado en Pecho, Hombro y Tríceps',
            instructor: 'Rodrigo Master',
            objetivo: 'Hipertrofia'
        }
    });

    await prisma.exercise.createMany({
        data: [
            { routineId: routine.id, nombre: 'Press de Banca', series: 4, reps: '10-12', descanso: '90s' },
            { routineId: routine.id, nombre: 'Press Militar', series: 3, reps: '10', descanso: '60s' },
            { routineId: routine.id, nombre: 'Fondos Tríceps', series: 3, reps: 'Falla', descanso: '60s' }
        ]
    });

    console.log('✅ Super Seed completado exitosamente.');
    console.log('Socio 1 Login: juan@demo.com / socio123');
    console.log('Admin Login: admin@gymaster.com / admin123');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
