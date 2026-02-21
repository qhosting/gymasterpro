
import { UserRole, MembershipStatus, Plan, Member, Transaction, BodyMetrics, NutritionAppointment } from './types';

export const GYM_PLANS: Plan[] = [
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

export const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', memberId: 'm1', monto: 350, fecha: '2024-05-20', metodo: 'Efectivo', tipo: 'Mensualidad', status: 'Completado' },
  { id: 't2', memberId: 'm2', monto: 800, fecha: '2024-05-21', metodo: 'Tarjeta', tipo: 'Mensualidad', status: 'Completado' },
  { id: 't3', memberId: 'm3', monto: 350, fecha: '2024-05-22', metodo: 'Transferencia', tipo: 'Mensualidad', status: 'Pendiente' },
];

export const MOCK_MEMBERS: Member[] = [
  {
    id: 'm1',
    nombre: 'Juan Pérez',
    email: 'juan@example.com',
    telefono: '5215512345678',
    role: UserRole.MIEMBRO,
    fechaRegistro: '2024-01-15',
    fechaVencimiento: '2024-02-15',
    planId: '1',
    status: MembershipStatus.ACTIVO,
    deuda: 0,
    foto: 'https://picsum.photos/seed/juan/100/100',
    fechaNacimiento: '1990-05-12',
    contactoEmergencia: 'Esposa - Ana',
    telefonoEmergencia: '5511223344',
    objetivo: 'Pérdida de peso',
    ultimaAsistencia: '2024-05-20'
  },
  {
    id: 'm2',
    nombre: 'Maria García',
    email: 'maria@example.com',
    telefono: '5215587654321',
    role: UserRole.MIEMBRO,
    fechaRegistro: '2023-12-10',
    fechaVencimiento: '2024-03-10',
    planId: '2',
    status: MembershipStatus.ACTIVO,
    deuda: 0,
    foto: 'https://picsum.photos/seed/maria/100/100',
    fechaNacimiento: '1985-11-20',
    contactoEmergencia: 'Hermano - Luis',
    telefonoEmergencia: '5544332211',
    objetivo: 'Hipertrofia',
    ultimaAsistencia: '2024-05-22'
  },
  {
    id: 'm3',
    nombre: 'Roberto Gomez',
    email: 'robert@example.com',
    telefono: '5215599887766',
    role: UserRole.MIEMBRO,
    fechaRegistro: '2024-01-01',
    fechaVencimiento: '2024-02-01',
    planId: '1',
    status: MembershipStatus.VENCIDO,
    deuda: 350,
    foto: 'https://picsum.photos/seed/robert/100/100',
    fechaNacimiento: '1995-02-28',
    contactoEmergencia: 'Madre - Rosa',
    telefonoEmergencia: '5599887766',
    objetivo: 'Mantenimiento',
    ultimaAsistencia: '2024-02-01'
  }
];

export const MOCK_METRICS: BodyMetrics[] = [
  { id: 'met1', memberId: 'm1', fecha: '2024-01-15', peso: 85, masaMuscular: 35, grasaCorporal: 25, agua: 55, imc: 27.5 },
  { id: 'met2', memberId: 'm1', fecha: '2024-02-15', peso: 83, masaMuscular: 36, grasaCorporal: 23, agua: 56, imc: 26.8 },
  { id: 'met3', memberId: 'm1', fecha: '2024-03-15', peso: 81, masaMuscular: 37, grasaCorporal: 21, agua: 58, imc: 26.1 },
  { id: 'met4', memberId: 'm2', fecha: '2024-03-10', peso: 65, masaMuscular: 28, grasaCorporal: 22, agua: 60, imc: 22.5 },
];

export const MOCK_APPOINTMENTS: NutritionAppointment[] = [
  { id: 'app1', memberId: 'm1', fecha: '2024-05-25', hora: '10:00', status: 'Programada' },
  { id: 'app2', memberId: 'm2', fecha: '2024-05-26', hora: '11:30', status: 'Programada' },
];
