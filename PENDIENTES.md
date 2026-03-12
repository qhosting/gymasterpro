# Pendientes y Roadmap - GymMaster PRO

Lista de tareas, mejoras y módulos faltantes para la evolución del sistema.

## 🚧 En Progreso
- [x] **Migración a Base de Datos**: Integración con PostgreSQL (`gympro-old-db`) usando Prisma y Node.js.
- [x] **Capas de Cache**: Implementación de **Redis** para optimizar la velocidad de respuesta en listados de socios.

## 🔴 Prioridad Alta (Crítico)
- [x] **Backend Real**: Implementar los endpoints de la API para conectar el frontend con Prisma.
- [x] **Autenticación real**: Implementar flujo de Login real con seguridad JWT y recuperación de contraseñas.
- [x] **Seguridad de API Keys**: Mover las llamadas a Gemini y WAHA a un servidor backend para proteger las credenciales.

## 🟡 Prioridad Media (Funcional)
- [x] **Carga de Archivos**: Implementar subida de imágenes localmente con Multer.
- [x] **Generación de QR**: Generador de códigos QR únicos por miembro integrado en el perfil.
- [x] **Reportes en PDF**: Exportación de estados financieros y recibos de pago con diseño premium.
- [x] **Validación de Formularios**: Integración de Zod y React Hook Form.

## 🟢 Prioridad Baja (Mejoras)
- [x] **Modo Offline**: Implementar almacenamiento local (IndexedDB) para permitir lectura de datos sin conexión.
- [x] **Temas Personalizados**: Opción de Modo Oscuro o cambio de colores de marca según el gimnasio.
- [x] **Gestión de Planes**: CRUD completo de planes de membresía desde el panel administrativo.
- [x] **Notificaciones Persistentes**: Guardado de historial de comunicaciones en base de datos.
- [x] **Notificaciones Push**: Scaffold e interfaz de configuración listos para producción.
- [x] **Tests Unitarios**: Configuración con Vitest y Testing Library completada con pruebas iniciales.

## 🚀 Innovación (Futuro)
- [x] **Entrenamiento Inteligente**: Generador de rutinas mediante IA/Plantillas basado en objetivos.
- [x] **Rankings de Comunidad**: Gamificación y leaderboard de asistencia (rachas).
- [x] **Integración con Wearables**: Conexión funcional con salud móvil (Apple/Google).
- [x] **Pasarela de Pagos**: Integración oficial con **Openpay** para pagos con tarjeta, además de soporte para Efectivo y SPEI.
