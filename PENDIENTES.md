# Pendientes y Roadmap - GymMaster PRO

Lista de tareas, mejoras y módulos faltantes para la evolución del sistema.

## 🚧 En Progreso
- [ ] **Migración a Base de Datos**: Integración con PostgreSQL (`gympro-old-db`) usando Prisma y Node.js.

## 🔴 Prioridad Alta (Crítico)
- [ ] **Backend Real**: Implementar los endpoints de la API para conectar el frontend con Prisma.
- [ ] **Autenticación real**: Implementar flujo de Login real con seguridad JWT y recuperación de contraseñas.
- [ ] **Seguridad de API Keys**: Mover las llamadas a Gemini y WAHA a un servidor backend para proteger las credenciales.

## 🟡 Prioridad Media (Funcional)
- [ ] **Carga de Archivos**: Implementar subida real de imágenes a un storage (S3/Cloudinary) para las fotos de perfil.
- [ ] **Pasarela de Pagos**: Integrar Stripe, MercadoPago o PayPal para pagos de membresías en línea.
- [ ] **Generación de QR**: Crear generador de códigos QR únicos por miembro dentro de su perfil.
- [ ] **Reportes en PDF**: Exportación de estados financieros y recibos de pago.
- [ ] **Validación de Formularios**: Agregar bibliotecas como Zod o Yup para validar entradas de datos.

## 🟢 Prioridad Baja (Mejoras)
- [ ] **Modo Offline**: Implementar almacenamiento local (IndexedDB) para permitir lectura de datos sin conexión.
- [ ] **Temas Personalizados**: Opción de Modo Oscuro o cambio de colores de marca según el gimnasio.
- [ ] **Notificaciones Push**: Implementar Firebase Cloud Messaging para alertas directas al celular.
- [ ] **Tests Unitarios**: Añadir cobertura de pruebas con Vitest y Testing Library.

## 🚀 Innovación (Futuro)
- [ ] **Entrenamiento Inteligente**: Generador de rutinas mediante IA basado en objetivos del socio.
- [ ] **Rankings de Comunidad**: Gamificación para incentivar la asistencia.
- [ ] **Integración con Wearables**: Conexión con Apple Health o Google Fit.
