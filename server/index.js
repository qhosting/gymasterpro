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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Prisma Setup (Prisma 7 Driver Adapter)
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const JWT_SECRET = process.env.JWT_SECRET || 'gym-master-pro-secret-key-2024';

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

// --- ENDPOINTS DE AUTENTICACIÓN ---

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma.user.findUnique({
            where: { email },
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

// --- ENDPOINTS DE MIEMBROS ---

// Listar miembros
app.get('/api/members', authenticateToken, async (req, res) => {
    try {
        const members = await prisma.member.findMany({
            include: { user: true, plan: true }
        });
        const transformedMembers = members.map(m => ({
            ...m.user,
            ...m,
            user: undefined
        }));
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
                    nombre: data.nombre,
                    email: data.email,
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
        res.status(201).json(result);
    } catch (error) {
        console.error('Error creating member:', error);
        res.status(500).json({ error: 'Error al crear miembro' });
    }
});

// Actualizar miembro
app.put('/api/members/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const result = await prisma.$transaction(async (tx) => {
            await tx.user.update({
                where: { id },
                data: {
                    nombre: data.nombre,
                    email: data.email,
                    foto: data.foto
                }
            });

            const member = await tx.member.update({
                where: { id },
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

            return member;
        });
        res.json(result);
    } catch (error) {
        console.error('Error updating member:', error);
        res.status(500).json({ error: 'Error al actualizar miembro' });
    }
});

// Eliminar miembro
app.delete('/api/members/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.member.delete({ where: { id } });
        await prisma.user.delete({ where: { id } });
        res.json({ message: 'Miembro eliminado con éxito' });
    } catch (error) {
        console.error('Error deleting member:', error);
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

// --- ENDPOINTS DE NUTRICIÓN Y MÉTRICAS ---

// Obtener métricas de un socio
app.get('/api/nutrition/metrics/:memberId', authenticateToken, async (req, res) => {
    const { memberId } = req.params;
    try {
        const metrics = await prisma.bodyMetrics.findMany({
            where: { memberId },
            orderBy: { fecha: 'asc' }
        });
        res.json(metrics);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener métricas' });
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

// Serve static files from the Vite build
app.use(express.static(path.join(__dirname, '../dist')));

// SPA Catch-all: Send all other requests to index.html
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
