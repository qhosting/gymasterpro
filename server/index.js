import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import fs from 'fs';
import { createClient } from 'redis';
import { GoogleGenAI } from "@google/genai";
import Openpay from 'openpay';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Prisma Setup (Prisma 7 Driver Adapter)
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const JWT_SECRET = process.env.JWT_SECRET || 'gym-master-pro-secret-key-2024';

// Redis Setup
const redisClient = createClient({
    url: process.env.REDIS_URL || 'redis://localhost:6379'
});

let isRedisConnected = false;

redisClient.on('error', (err) => {
    if (isRedisConnected) {
        console.log('Redis Client Error', err);
    }
});

(async () => {
    try {
        await redisClient.connect();
        isRedisConnected = true;
        console.log('Connected to Redis');
    } catch (err) {
        console.warn('⚠️ Redis not available. Running without cache.');
    }
})();

// Middleware para verificar JWT
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Acceso denegado' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Token inválido' });
        req.user = user;
        next();
    });
};

app.use(cors());
app.use(express.json());

// --- CONFIGURACIÓN DE CARGA DE ARCHIVOS ---
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = 'uploads/';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) cb(null, true);
        else cb(new Error('Solo se permiten imágenes'), false);
    }
});

// Servir archivos de la carpeta uploads
app.use('/uploads', express.static('uploads'));

// --- ENDPOINTS DE AUTENTICACIÓN ---

app.post('/api/upload', authenticateToken, upload.single('foto'), (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No se subió ningún archivo' });
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url });
});

app.post('/api/login', async (req, res) => {
    const { email, identifier, password } = req.body;
    const loginValue = identifier || email; // Soporta ambos nombres de campo

    try {
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: loginValue },
                    { telefono: loginValue }
                ]
            },
            include: { member: true }
        });

        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

        const validPassword = await bcrypt.compare(password, user.password || '');
        if (!validPassword) return res.status(401).json({ error: 'Contraseña incorrecta' });

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            token,
            user: {
                id: user.id,
                nombre: user.nombre,
                email: user.email,
                role: user.role,
                foto: user.foto,
                memberId: user.member?.id
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Error en el servidor' });
    }
});

app.get('/api/me', authenticateToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            include: { member: true }
        });
        if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
        res.json({
            id: user.id,
            nombre: user.nombre,
            email: user.email,
            role: user.role,
            foto: user.foto,
            memberId: user.member?.id
        });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener datos del usuario' });
    }
});

// --- ENDPOINTS DE STAFF ---
app.get('/api/staff', authenticateToken, async (req, res) => {
    try {
        const staff = await prisma.user.findMany({
            where: {
                role: {
                    in: ['ADMIN', 'SUPER_ADMIN', 'INSTRUCTOR', 'NUTRIOLOGO']
                }
            },
            select: {
                id: true,
                nombre: true,
                email: true,
                role: true,
                foto: true
            }
        });
        res.json(staff);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener staff' });
    }
});

// --- ENDPOINTS DE MIEMBROS ---

// Listar miembros
app.get('/api/members', authenticateToken, async (req, res) => {
    try {
        const members = await prisma.member.findMany({
            include: { user: true, plan: true }
        });
        
        const transformedMembers = members.map(m => ({
            ...m.user,
            id: m.id,
            planId: m.planId,
            status: m.status,
            deuda: m.deuda,
            fechaVencimiento: m.fechaVencimiento.toISOString().split('T')[0],
            fechaNacimiento: m.fechaNacimiento ? m.fechaNacimiento.toISOString().split('T')[0] : null,
            objetivo: m.objetivo,
            telefonoEmergencia: m.telefonoEmergencia,
            contactoEmergencia: m.contactoEmergencia,
            fechaRegistro: m.user.createdAt ? m.user.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
        }));

        console.log(`Serving ${transformedMembers.length} members from Database`);
        res.json(transformedMembers);
    } catch (error) {
        console.error('Error fetching members:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Crear miembro
app.post('/api/members', authenticateToken, async (req, res) => {
    const data = req.body;
    try {
        const result = await prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    nombre: data.nombre.trim(),
                    email: data.email.trim().toLowerCase(),
                    telefono: data.telefono && data.telefono.trim() !== '' ? data.telefono.trim() : null,
                    role: data.role || 'MIEMBRO',
                    foto: data.foto
                }
            });

            const member = await tx.member.create({
                data: {
                    id: user.id,
                    planId: data.planId,
                    fechaVencimiento: new Date(data.fechaVencimiento),
                    status: data.status || 'PENDIENTE',
                    deuda: parseFloat(data.deuda || 0),
                    objetivo: data.objetivo,
                    telefonoEmergencia: data.telefonoEmergencia,
                    contactoEmergencia: data.contactoEmergencia
                }
            });

            return { ...user, ...member };
        });

        // Invalidar cache de miembros
        if (redisClient.isOpen) await redisClient.del('all_members_list');
        
        res.status(201).json(result);
    } catch (error) {
        console.error('SERVER ERROR [CREATE MEMBER]:', JSON.stringify(error, null, 2));
        if (error.code === 'P2002') {
            const getFields = (err) => {
                if (err.meta?.target) return Array.isArray(err.meta.target) ? err.meta.target : [err.meta.target];
                const driverFields = err.meta?.driverAdapterError?.cause?.constraint?.fields;
                if (driverFields) return Array.isArray(driverFields) ? driverFields : [driverFields];
                return [];
            };
            
            const fields = getFields(error);
            const isEmail = fields.some(f => f.includes('email'));
            const isPhone = fields.some(f => f.includes('telefono'));
            
            let msg = 'Ya existe un registro con esos datos.';
            if (isEmail) msg = `El correo "${data.email.toLowerCase()}" ya pertenece a otro socio.`;
            else if (isPhone) msg = `El teléfono "${data.telefono}" ya pertenece a otro socio.`;
            
            return res.status(400).json({ error: msg });
        }
        res.status(500).json({ error: 'Error al crear miembro' });
    }
});

// Actualizar miembro
app.put('/api/members/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const result = await prisma.$transaction(async (tx) => {
            const userData = {
                nombre: data.nombre.trim(),
                email: data.email.trim().toLowerCase(),
                telefono: data.telefono && data.telefono.trim() !== '' ? data.telefono.trim() : null,
                foto: data.foto
            };

            // Solo actualizar contraseña si se proporciona una nueva
            if (data.password && data.password.trim() !== '') {
                userData.password = await bcrypt.hash(data.password, 10);
            }

            const user = await tx.user.update({
                where: { id },
                data: userData
            });

            const member = await tx.member.update({
                where: { id },
                include: { user: true, plan: true },
                data: {
                    planId: data.planId,
                    fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : undefined,
                    status: data.status,
                    deuda: data.deuda !== undefined ? parseFloat(data.deuda) : undefined,
                    objetivo: data.objetivo,
                    telefonoEmergencia: data.telefonoEmergencia,
                    contactoEmergencia: data.contactoEmergencia
                }
            });

            // Devolver objeto transformado consistente con el listado
            return {
                ...member.user,
                id: member.id,
                planId: member.planId,
                status: member.status,
                deuda: member.deuda,
                fechaVencimiento: member.fechaVencimiento.toISOString().split('T')[0],
                fechaNacimiento: member.fechaNacimiento ? member.fechaNacimiento.toISOString().split('T')[0] : null,
                objetivo: member.objetivo,
                telefonoEmergencia: member.telefonoEmergencia,
                contactoEmergencia: member.contactoEmergencia,
                fechaRegistro: member.user.createdAt ? member.user.createdAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
            };
        });

        // Invalidar cache de miembros
        if (redisClient.isOpen) await redisClient.del('all_members_list');
        
        res.json(result);
    } catch (error) {
        console.error('SERVER ERROR [UPDATE MEMBER]:', JSON.stringify(error, null, 2));
        if (error.code === 'P2002') {
            const getFields = (err) => {
                if (err.meta?.target) return Array.isArray(err.meta.target) ? err.meta.target : [err.meta.target];
                const driverFields = err.meta?.driverAdapterError?.cause?.constraint?.fields;
                if (driverFields) return Array.isArray(driverFields) ? driverFields : [driverFields];
                return [];
            };

            const fields = getFields(error);
            const isEmail = fields.some(f => f.includes('email'));
            const isPhone = fields.some(f => f.includes('telefono'));
            
            let msg = 'Los nuevos datos ya pertenecen a otro socio.';
            if (isEmail) msg = `El correo "${data.email.toLowerCase()}" ya pertenece a otro socio.`;
            else if (isPhone) msg = `El teléfono "${data.telefono}" ya pertenece a otro socio.`;
            
            return res.status(400).json({ error: msg });
        }
        res.status(500).json({ error: 'Error al actualizar miembro' });
    }
});

// Eliminar miembro
app.delete('/api/members/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.$transaction(async (tx) => {
            // Intentar borrar Member primero por integridad
            await tx.member.deleteMany({ where: { id } });
            // Luego borrar User
            await tx.user.deleteMany({ where: { id } });
        });

        // Invalidar cache de miembros
        if (redisClient.isOpen) await redisClient.del('all_members_list');
        
        res.json({ message: 'Miembro eliminado con éxito' });
    } catch (error) {
        console.error('SERVER ERROR [DELETE MEMBER]:', JSON.stringify(error, null, 2));
        res.status(500).json({ error: 'Error al eliminar miembro' });
    }
});

// --- OTROS ENDPOINTS ---

// Listar planes
app.get('/api/plans', async (req, res) => {
    try {
        const plans = await prisma.plan.findMany();
        res.json(plans);
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Crear plan
app.post('/api/plans', authenticateToken, async (req, res) => {
    const data = req.body;
    try {
        const plan = await prisma.plan.create({ data });
        res.status(201).json(plan);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear plan' });
    }
});

// Actualizar plan
app.put('/api/plans/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const plan = await prisma.plan.update({
            where: { id },
            data
        });
        res.json(plan);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar plan' });
    }
});

// Eliminar plan
app.delete('/api/plans/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.plan.delete({ where: { id } });
        res.json({ message: 'Plan eliminado' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar plan' });
    }
});

// Registrar Entrada
app.post('/api/attendance', authenticateToken, async (req, res) => {
    const { memberId } = req.body;
    try {
        const attendance = await prisma.attendance.create({
            data: { memberId }
        });
        await prisma.member.update({
            where: { id: memberId },
            data: { 
                ultimaAsistencia: new Date(),
                rachaDias: { increment: 1 } 
            }
        });
        res.json(attendance);
    } catch (error) {
        console.error('Error recording attendance:', error);
        res.status(500).json({ error: 'Error al registrar asistencia' });
    }
});

// Registrar Salida
app.put('/api/attendance/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const attendance = await prisma.attendance.update({
            where: { id },
            data: { salida: new Date() }
        });
        res.json(attendance);
    } catch (error) {
        console.error('Error recording checkout:', error);
        res.status(500).json({ error: 'Error al registrar salida' });
    }
});

// Listar asistencia de hoy
app.get('/api/attendance/today', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const attendance = await prisma.attendance.findMany({
            where: {
                entrada: { gte: today }
            },
            include: { member: { include: { user: true } } },
            orderBy: { entrada: 'desc' }
        });
        res.json(attendance);
    } catch (error) {
        console.error('Error fetching today attendance:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Estadísticas de asistencia (últimos 7 días)
app.get('/api/stats/attendance', authenticateToken, async (req, res) => {
    try {
        const stats = [];
        const days = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
        const today = new Date();

        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            date.setHours(0, 0, 0, 0);
            
            const nextDate = new Date(date);
            nextDate.setDate(date.getDate() + 1);

            const count = await prisma.attendance.count({
                where: {
                    entrada: {
                        gte: date,
                        lt: nextDate
                    }
                }
            });

            stats.push({
                name: days[date.getDay()],
                visitas: count
            });
        }
        res.json(stats);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
});

// --- CONFIGURACIÓN DEL SISTEMA ---

// Obtener configuración
app.get('/api/settings', authenticateToken, async (req, res) => {
    try {
        let settings = await prisma.systemSettings.findUnique({
            where: { id: 'default' }
        });

        if (!settings) {
            settings = await prisma.systemSettings.create({
                data: { id: 'default' }
            });
        }
        res.json(settings);
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Actualizar configuración
app.put('/api/settings', authenticateToken, async (req, res) => {
    try {
        const data = req.body;
        const settings = await prisma.systemSettings.upsert({
            where: { id: 'default' },
            update: data,
            create: { ...data, id: 'default' }
        });
        res.json(settings);
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Registrar Transacción (Pago)
app.post('/api/transactions', authenticateToken, async (req, res) => {
    const { memberId, monto, metodo, tipo, status } = req.body;
    try {
        const transaction = await prisma.transaction.create({
            data: { memberId, monto: parseFloat(monto), metodo, tipo, status }
        });
        
        if (status === 'Completado' && tipo === 'Mensualidad') {
            await prisma.member.update({
                where: { id: memberId },
                data: { deuda: { decrement: parseFloat(monto) } }
            });
        }
        
        res.json(transaction);
    } catch (error) {
        console.error('Error recording transaction:', error);
        res.status(500).json({ error: 'Error al registrar pago' });
    }
});

// Listar Transacciones
app.get('/api/transactions', authenticateToken, async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            orderBy: { fecha: 'desc' }
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// --- OPENPAY PAYMENTS ---
app.post('/api/payments/openpay', authenticateToken, async (req, res) => {
    const { token, deviceSessionId, amount, memberId, description } = req.body;
    
    try {
        const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } });
        
        if (!settings || !settings.openpayMerchantId || !settings.openpayPrivateKey) {
            return res.status(400).json({ error: 'Openpay no está configurado correctamente' });
        }

        const openpay = new Openpay(
            settings.openpayMerchantId, 
            settings.openpayPrivateKey, 
            settings.openpaySandbox
        );

        const member = await prisma.member.findUnique({ 
            where: { id: memberId },
            include: { user: true }
        });

        if (!member) return res.status(404).json({ error: 'Socio no encontrado' });

        const chargeRequest = {
            source_id: token,
            method: 'card',
            amount: parseFloat(amount),
            currency: 'MXN',
            description: description || 'Pago de Membresía GymMaster',
            device_session_id: deviceSessionId,
            customer: {
                name: member.user.nombre,
                email: member.user.email,
                phone_number: member.user.telefono || '5555555555'
            }
        };

        openpay.charges.create(chargeRequest, async (error, charge) => {
            if (error) {
                console.error('Openpay Error:', error);
                return res.status(error.http_code || 500).json({ 
                    error: error.description, 
                    code: error.error_code 
                });
            }

            // Registrar transacción en DB
            const transaction = await prisma.transaction.create({
                data: {
                    memberId,
                    monto: parseFloat(amount),
                    metodo: 'Openpay',
                    tipo: description && description.includes('Inscripción') ? 'Inscripción' : 'Mensualidad',
                    status: 'Completado'
                }
            });

            // Actualizar deuda si es mensualidad
            if (transaction.tipo === 'Mensualidad') {
                await prisma.member.update({
                    where: { id: memberId },
                    data: { deuda: { decrement: parseFloat(amount) } }
                });
            }

            res.json({ success: true, charge, transaction });
        });

    } catch (error) {
        console.error('Openpay Integration Error:', error);
        res.status(500).json({ error: 'Error interno al procesar el pago' });
    }
});

// --- ENDPOINTS DE NUTRICIÓN Y MÉTRICAS ---

// Obtener métricas y recomendación real
app.get('/api/nutrition/data/:memberId', authenticateToken, async (req, res) => {
    const { memberId } = req.params;
    try {
        const [metrics, attendance] = await Promise.all([
            prisma.bodyMetrics.findMany({ where: { memberId }, orderBy: { fecha: 'asc' } }),
            prisma.attendance.findMany({ where: { memberId } })
        ]);

        // Analysis Logic based on REAL data
        let recommendation = "Continúa con tu entrenamiento constante. No olvides hidratarte.";
        const latest = metrics[metrics.length - 1];
        const previous = metrics[metrics.length - 2];

        if (latest) {
            if (previous && latest.peso < previous.peso) {
                recommendation = "¡Excelente progreso! Has bajado de peso. Aumenta tu proteína para mantener músculo.";
            } else if (latest.grasaCorporal > 25) {
                recommendation = "Tu porcentaje de grasa es alto. Enfócate en cardio y déficit calórico leve.";
            } else if (latest.agua < 50) {
                recommendation = "Estás deshidratado. Intenta beber al menos 3 litros de agua al día.";
            }
            if (attendance.length > 15) {
                recommendation += " Tu racha es increíble, considera un día de descanso activo.";
            }
        }

        res.json({ metrics, recommendation });
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener datos de nutrición' });
    }
});

// Registrar nuevas métricas
app.post('/api/nutrition/metrics', authenticateToken, async (req, res) => {
    const data = req.body;
    try {
        const metrics = await prisma.bodyMetrics.create({
            data: {
                memberId: data.memberId,
                peso: parseFloat(data.peso),
                masaMuscular: parseFloat(data.masaMuscular),
                grasaCorporal: parseFloat(data.grasaCorporal),
                agua: parseFloat(data.agua),
                imc: parseFloat(data.imc)
            }
        });
        res.status(201).json(metrics);
    } catch (error) {
        res.status(500).json({ error: 'Error al registrar métricas' });
    }
});

// Listar todas las citas (para admin/nutriólogo) o por socio
app.get('/api/nutrition/appointments', authenticateToken, async (req, res) => {
    const { memberId } = req.query;
    try {
        const appointments = await prisma.appointment.findMany({
            where: memberId ? { memberId: String(memberId) } : {},
            include: { member: { include: { user: true } } },
            orderBy: { fecha: 'asc' }
        });
        res.json(appointments);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener citas' });
    }
});

// Agendar cita
app.post('/api/nutrition/appointments', authenticateToken, async (req, res) => {
    const data = req.body;
    try {
        const appointment = await prisma.appointment.create({
            data: {
                memberId: data.memberId,
                fecha: new Date(data.fecha),
                hora: data.hora,
                status: 'Programada'
            }
        });
        res.status(201).json(appointment);
    } catch (error) {
        res.status(500).json({ error: 'Error al agendar cita' });
    }
});

// --- ENDPOINTS DE ENTRENAMIENTO ---

// Obtener rutinas de un socio
app.get('/api/training/routines/:memberId', authenticateToken, async (req, res) => {
    const { memberId } = req.params;
    try {
        const routines = await prisma.routine.findMany({
            where: { memberId },
            include: { exercises: true },
            orderBy: { fecha: 'desc' }
        });
        res.json(routines);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener rutinas' });
    }
});

// Crear rutina manual
app.post('/api/training/routines', authenticateToken, async (req, res) => {
    const { memberId, nombre, descripcion, instructor, objetivo, exercises } = req.body;
    try {
        const routine = await prisma.routine.create({
            data: {
                memberId,
                nombre,
                descripcion,
                instructor,
                objetivo,
                exercises: {
                    create: exercises
                }
            },
            include: { exercises: true }
        });
        res.status(201).json(routine);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear rutina' });
    }
});

// Generador Inteligente de Entrenamiento
app.post('/api/training/generate', authenticateToken, async (req, res) => {
    const { memberId, objetivo } = req.body;
    
    // Aquí iría la lógica de IA o Generador Automático
    const templates = {
        'Pérdida de peso': [
            { nombre: 'Burpees', series: 4, reps: '15', descanso: '30s' },
            { nombre: 'Salto de cuerda', series: 4, reps: '2 min', descanso: '30s' },
            { nombre: 'Sentadillas con salto', series: 4, reps: '20', descanso: '45s' },
            { nombre: 'Plancha (Plank)', series: 3, reps: '1 min', descanso: '60s' }
        ],
        'Ganancia muscular': [
            { nombre: 'Press de Banca', series: 4, reps: '8-12', descanso: '90s' },
            { nombre: 'Peso Muerto', series: 3, reps: '8-10', descanso: '120s' },
            { nombre: 'Sentadilla Libre', series: 4, reps: '10-12', descanso: '90s' },
            { nombre: 'Curl de Bíceps', series: 3, reps: '12', descanso: '60s' }
        ]
    };

    const selectedExercises = templates[objetivo] || templates['Pérdida de peso'];

    try {
        const routine = await prisma.routine.create({
            data: {
                memberId,
                nombre: `Rutina Inteligente - ${objetivo}`,
                descripcion: 'Generada automáticamente basado en tus objetivos fit.',
                instructor: 'AI Trainer',
                objetivo: objetivo,
                exercises: {
                    create: selectedExercises
                }
            },
            include: { exercises: true }
        });
        res.status(201).json(routine);
    } catch (error) {
        res.status(500).json({ error: 'Error al generar rutina inteligente' });
    }
});

// --- ENDPOINTS DE COMUNIDAD ---

// Obtener rankings (Top 10 rachas)
app.get('/api/community/rankings', authenticateToken, async (req, res) => {
    try {
        const rankings = await prisma.member.findMany({
            include: { user: true },
            orderBy: { rachaDias: 'desc' },
            take: 10
        });
        res.json(rankings);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener rankings' });
    }
});

// Obtener perfil completo con logros y conectividad
app.get('/api/member/profile/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        const member = await prisma.member.findUnique({
            where: { id },
            include: { user: true, plan: true }
        });
        if (!member) return res.status(404).json({ error: 'Socio no encontrado' });
        
        // Flatten and transform for frontend
        const profile = {
            ...member.user,
            ...member,
            plan: member.plan,
            fechaRegistro: member.fechaRegistro.toISOString().split('T')[0],
            fechaVencimiento: member.fechaVencimiento.toISOString().split('T')[0]
        };
        delete profile.user; // Remove nested user object
        
        res.json(profile);
    } catch (error) {
        console.error('Error fetching full profile:', error);
        res.status(500).json({ error: 'Error al obtener perfil' });
    }
});

// Actualizar conectividad y settings
app.patch('/api/member/settings/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const member = await prisma.member.update({
            where: { id },
            data: {
                conectadoApple: data.conectadoApple,
                conectadoGoogle: data.conectadoGoogle,
                pushEnabled: data.pushEnabled
            }
        });
        res.json(member);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar configuración' });
    }
});

// --- AI & WHATSAPP SECURE ENDPOINTS ---

// Generar análisis o plantillas con Gemini
app.post('/api/ai/process', authenticateToken, async (req, res) => {
    const { prompt, type, base64Image } = req.body;
    try {
        const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } });
        if (!settings?.geminiKey) return res.status(400).json({ error: 'API Key de Gemini no configurada' });

        const genAI = new GoogleGenAI(settings.geminiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        if (type === 'vision' && base64Image) {
            const result = await model.generateContent([
                prompt,
                { inlineData: { data: base64Image.split(',')[1], mimeType: 'image/jpeg' } }
            ]);
            return res.json({ text: result.response.text() });
        }

        const result = await model.generateContent(prompt);
        res.json({ text: result.response.text() });
    } catch (error) {
        console.error('AI Process Error:', error);
        res.status(500).json({ error: 'Error al procesar con IA' });
    }
});

// Enviar WhatsApp vía WAHA
app.post('/api/whatsapp/send', authenticateToken, async (req, res) => {
    const { phone, text } = req.body;
    try {
        const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } });
        if (!settings?.wahaUrl) return res.status(400).json({ error: 'WAHA no configurado' });

        const chatId = phone.includes('@') ? phone : `${phone.replace('+', '')}@c.us`;
        
        const response = await fetch(`${settings.wahaUrl}/api/sendText`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(settings.wahaKey ? { 'X-Api-Key': settings.wahaKey } : {})
            },
            body: JSON.stringify({
                chatId: chatId,
                text: text,
                session: 'default'
            })
        });

        if (!response.ok) throw new Error('WAHA respondio con error');
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('WhatsApp Send Error:', error);
        res.status(500).json({ error: 'Error al enviar mensaje' });
    }
});

// Checar estado de WAHA
app.get('/api/whatsapp/status', authenticateToken, async (req, res) => {
    try {
        const settings = await prisma.systemSettings.findUnique({ where: { id: 'default' } });
        if (!settings?.wahaUrl) return res.json({ online: false });

        const response = await fetch(`${settings.wahaUrl}/api/sessions/default`, {
            headers: settings.wahaKey ? { 'X-Api-Key': settings.wahaKey } : {}
        });
        res.json({ online: response.ok });
    } catch {
        res.json({ online: false });
    }
});

// --- ENDPOINTS DE NOTIFICACIONES ---

// Obtener todas las notificaciones
app.get('/api/notifications', authenticateToken, async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany({
            include: { member: { include: { user: true } } },
            orderBy: { timestamp: 'desc' },
            take: 50
        });
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener notificaciones' });
    }
});

// Crear notificación (Log)
app.post('/api/notifications', authenticateToken, async (req, res) => {
    const { memberId, tipo, mensaje, status } = req.body;
    try {
        const notification = await prisma.notification.create({
            data: { memberId, tipo, mensaje, status: status || 'sent' }
        });
        res.status(201).json(notification);
    } catch (error) {
        res.status(500).json({ error: 'Error al guardar notificación' });
    }
});

// Marcar como leída
app.patch('/api/notifications/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { read } = req.body;
    try {
        const notification = await prisma.notification.update({
            where: { id },
            data: { read }
        });
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: 'Error al actualizar notificación' });
    }
});

// Serve static files from the Vite build
app.use(express.static(path.join(__dirname, '../dist')));

// SPA Catch-all: Send all other requests to index.html
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
