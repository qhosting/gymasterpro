
export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  MIEMBRO = 'MIEMBRO',
  NUTRIOLOGO = 'NUTRIOLOGO'
}

export enum MembershipStatus {
  ACTIVO = 'ACTIVO',
  VENCIDO = 'VENCIDO',
  PENDIENTE = 'PENDIENTE'
}

export interface User {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  role: UserRole;
  foto?: string;
}

export interface Member extends User {
  fechaRegistro: string;
  fechaVencimiento: string;
  planId: string;
  status: MembershipStatus;
  deuda: number;
  fechaNacimiento?: string;
  contactoEmergencia?: string;
  telefonoEmergencia?: string;
  objetivo?: string;
  notas?: string;
  ultimaAsistencia?: string;
  rachaDias?: number;
}

// Fix: Added missing AttendanceRecord interface for tracking gym entry/exit
export interface AttendanceRecord {
  memberId: string;
  entrada: Date;
}

// Fix: Added missing Transaction interface for financial record keeping
export interface Transaction {
  id: string;
  memberId: string;
  monto: number;
  fecha: string;
  metodo: 'Efectivo' | 'Tarjeta' | 'Transferencia';
  tipo: 'Mensualidad' | 'Inscripción' | 'Producto' | 'Otro';
  status: 'Completado' | 'Pendiente';
}

export interface NotificationLog {
  id: string;
  memberId: string;
  timestamp: string;
  mensaje: string;
  tipo: string;
  status: 'sent' | 'delivered' | 'failed';
  read?: boolean;
}

export interface WahaConfig {
  apiUrl: string;
  apiKey: string;
  session: string;
}

export interface Plan {
  id: string;
  nombre: string;
  costo: number;
  duracionMeses: number;
  beneficios?: string[];
  color?: string;
}

export interface BodyMetrics {
  id: string;
  memberId: string;
  fecha: string;
  peso: number; // kg
  masaMuscular: number; // % or kg
  grasaCorporal: number; // %
  agua: number; // %
  imc: number;
}

export interface NutritionAppointment {
  id: string;
  memberId: string;
  fecha: string;
  hora: string;
  status: 'Programada' | 'Completada' | 'Cancelada';
  notas?: string;
}

export interface Exercise {
  id?: string;
  nombre: string;
  series: number;
  reps: string;
  descanso?: string;
  notas?: string;
  videoUrl?: string;
}

export interface Routine {
  id: string;
  memberId: string;
  nombre: string;
  descripcion?: string;
  fecha: string;
  instructor?: string;
  objetivo?: string;
  exercises: Exercise[];
}
