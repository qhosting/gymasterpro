// --- ENDPOINTS DE SUCURSALES (GYMS) ---
app.get('/api/gyms', async (req, res) => {
    try {
        const gyms = await prisma.gym.findMany();
        res.json(gyms);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener sucursales' });
    }
});

app.post('/api/gyms', authenticateToken, async (req, res) => {
    if (req.user.role !== 'ADMIN' && req.user.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'No autorizado' });
    }
    try {
        const gym = await prisma.gym.create({ data: req.body });
        res.status(201).json(gym);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear sucursal' });
    }
});

// --- ENDPOINTS DE CLASES GRUPALES ---
app.get('/api/classes', authenticateToken, async (req, res) => {
    const { gymId, categoria } = req.query;
    try {
        const classes = await prisma.class.findMany({
            where: {
                ...(gymId ? { gymId } : {}),
                ...(categoria ? { categoria } : {})
            },
            include: { 
                instructor: { select: { nombre: true, foto: true } },
                gym: true,
                bookings: true
            }
        });
        res.json(classes);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener clases' });
    }
});

app.post('/api/classes', authenticateToken, async (req, res) => {
    const role = req.user.role;
    if (role !== 'ADMIN' && role !== 'SUPER_ADMIN' && role !== 'INSTRUCTOR') {
        return res.status(403).json({ error: 'No autorizado' });
    }
    try {
        const groupClass = await prisma.class.create({ 
            data: {
                ...req.body,
                instructorId: req.body.instructorId || req.user.id
            } 
        });
        res.status(201).json(groupClass);
    } catch (error) {
        res.status(500).json({ error: 'Error al crear clase' });
    }
});

// --- ENDPOINTS DE RESERVAS (BOOKINGS) ---
app.post('/api/classes/book', authenticateToken, async (req, res) => {
    const { classId, fecha } = req.body;
    const memberId = req.user.id;

    try {
        const groupClass = await prisma.class.findUnique({
            where: { id: classId },
            include: { bookings: { where: { fecha: new Date(fecha), status: 'RESERVED' } } }
        });

        if (groupClass.bookings.length >= groupClass.capacidad) {
            return res.status(400).json({ error: 'Clase llena' });
        }

        const booking = await prisma.classBooking.create({
            data: {
                classId,
                memberId,
                fecha: new Date(fecha),
                status: 'RESERVED'
            }
        });

        res.status(201).json(booking);
    } catch (error) {
        if (error.code === 'P2002') return res.status(400).json({ error: 'Ya tienes una reserva para esta fecha' });
        res.status(500).json({ error: 'Error al reservar clase' });
    }
});

app.get('/api/classes/my-bookings', authenticateToken, async (req, res) => {
    try {
        const bookings = await prisma.classBooking.findMany({
            where: { memberId: req.user.id },
            include: { clase: { include: { gym: true, instructor: true } } },
            orderBy: { fecha: 'asc' }
        });
        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener tus reservas' });
    }
});

app.patch('/api/classes/bookings/:id/cancel', authenticateToken, async (req, res) => {
    try {
        const booking = await prisma.classBooking.findUnique({
            where: { id: req.params.id },
            include: { clase: { include: { gym: true } } }
        });

        if (!booking) return res.status(404).json({ error: 'Reserva no encontrada' });

        const window = booking.clase.cancellationWindowOverride || booking.clase.gym.cancellationWindow;
        const classDate = new Date(booking.fecha);
        const limitDate = new Date(classDate.getTime() - (window * 60 * 60 * 1000));

        if (new Date() > limitDate && req.user.role === 'MIEMBRO') {
            return res.status(400).json({ error: `No puedes cancelar con menos de ${window} horas de anticipación` });
        }

        const updated = await prisma.classBooking.update({
            where: { id: req.params.id },
            data: { status: 'CANCELED' }
        });

        res.json(updated);
    } catch (error) {
        res.status(500).json({ error: 'Error al cancelar reserva' });
    }
});

// --- DIARIO DEL COACH ---
app.get('/api/instructor/diary', authenticateToken, async (req, res) => {
    if (req.user.role !== 'INSTRUCTOR') return res.status(403).json({ error: 'Solo para coaches' });
    try {
        const diary = await prisma.class.findMany({
            where: { instructorId: req.user.id },
            include: { 
                gym: true,
                bookings: { 
                    where: { status: 'RESERVED' },
                    include: { miembro: { include: { user: true } } }
                }
            },
            orderBy: { diaSemana: 'asc' }
        });
        res.json(diary);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener diario' });
    }
});

// --- ENDPOINTS DE NOTIFICACIONES ---
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
