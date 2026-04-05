
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
  isPublic?: boolean;
  especialidad?: string;
  biografia?: string;
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

export interface AttendanceRecord {
  memberId: string;
  entrada: Date;
}

export interface Transaction {
  id: string;
  memberId: string;
  monto: number;
  fecha: string;
  metodo: 'Efectivo' | 'Tarjeta' | 'Transferencia' | 'Openpay';
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

export interface Business {
  id: string;
  nombre: string;
  logo?: string;
  status: 'ACTIVO' | 'SUSPENDIDO';
  createdAt: string;
  _count?: {
      gyms: number;
      users: number;
  }
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

export interface SystemSettings {
  id: string;
  gymName: string;
  aforoMaximo: number;
  direccion?: string;
  horario?: string;
  wahaUrl?: string;
  wahaKey?: string;
  geminiKey?: string;
  openpayMerchantId?: string;
  openpayPublicKey?: string;
  openpayPrivateKey?: string;
  openpaySandbox: boolean;
  pushEnabled: boolean;
  backupEnabled: boolean;
  primaryColor: string;
  darkMode: boolean;
}

// NUEVOS TIPOS PARA CLASES Y SUCURSALES
export enum ClassCategory {
  PESAS = 'PESAS',
  SPIN = 'SPIN',
  YOGA = 'YOGA',
  ZUMBA = 'ZUMBA',
  BOX = 'BOX',
  PILATES = 'PILATES',
  FUNCIONAL = 'FUNCIONAL'
}

export enum BookingStatus {
  RESERVED = 'RESERVED',
  CANCELED = 'CANCELED',
  ATTENDED = 'ATTENDED'
}

export interface Gym {
  id: string;
  nombre: string;
  direccion?: string;
  cancellationWindow: number; // Horas
}

export interface GroupClass {
  id: string;
  nombre: string;
  categoria: ClassCategory;
  instructorId: string;
  gymId: string;
  diaSemana: number; // 0-6
  horaInicio: string; // "HH:mm"
  horaFin: string;
  capacidad: number;
  cancellationWindowOverride?: number;
  instructor?: User;
  gym?: Gym;
  bookings?: ClassBooking[];
}

export interface ClassBooking {
  id: string;
  classId: string;
  memberId: string;
  fecha: string;
  status: BookingStatus;
  createdAt: string;
  clase?: GroupClass;
  miembro?: Member;
}
