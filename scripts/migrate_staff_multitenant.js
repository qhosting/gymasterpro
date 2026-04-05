
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Iniciando Migración de Personal a Multitenant ---');
    
    // 1. Obtener todos los usuarios que tienen un businessId
    const users = await prisma.user.findMany({
        where: {
            businessId: { not: null },
            role: { in: ['ADMIN', 'INSTRUCTOR', 'NUTRIOLOGO'] }
        }
    });

    console.log(`Encontrados ${users.length} miembros del staff para migrar.`);

    let migrated = 0;
    for (const user of users) {
        try {
            // 2. Crear el registro en UserBusiness si no existe
            await prisma.userBusiness.upsert({
                where: {
                    userId_businessId: {
                        userId: user.id,
                        businessId: user.businessId
                    }
                },
                update: {
                    role: user.role,
                    isActive: true
                },
                create: {
                    userId: user.id,
                    businessId: user.businessId,
                    role: user.role,
                    isActive: true
                }
            });
            migrated++;
        } catch (error) {
            console.error(`Error migrando usuario ${user.email}:`, error);
        }
    }

    console.log(`--- Migración completada: ${migrated}/${users.length} procesados ---`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
