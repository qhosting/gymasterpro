# Funciones del Sistema - AurumFit PRO

Este documento detalla las funcionalidades actualmente implementadas en el sistema AurumFit PRO.

## 1. Gestión de Miembros
- **Listado Completo**: Visualización de todos los socios con buscador y filtros por estado (Activo, Vencido, Pendiente).
- **Perfiles Detallados**: Información personal, contacto de emergencia, objetivos y historial de asistencia.
- **Alta y Edición**: Formulario para registrar nuevos miembros o actualizar los existentes (persistencia en estado local).

## 2. Control de Asistencia
- **Escáner QR**: Integración con cámara para lectura de códigos QR de miembros.
- **Registro Manual**: Opción para registrar entrada/salida de socios por nombre.
- **Estadísticas de Racha**: Seguimiento de días consecutivos de entrenamiento.

## 3. Finanzas y Planes
- **Catálogo de Planes**: Gestión de tipos de membresía (Básico, Premium, Anual) con costos y beneficios.
- **Control de Pagos**: Registro de transacciones (Efectivo, Tarjeta, Transferencia) y seguimiento de deudas.
- **Dashboard Financiero**: Gráficas de ingresos y comparativas mensuales.

## 4. Nutrición y Salud
- **Métricas Corporales**: Seguimiento de Peso, % Grasa, Masa Muscular, Agua e IMC.
- **Citas Nutricionales**: Agenda de consultas con estados (Programada, Completada, Cancelada).
- **Historial Evolutivo**: Visualización de progreso físico del miembro.

## 5. Comunicación y Notificaciones
- **Centro de Notificaciones**: Alertas automáticas por membresías próximas a vencer o pagos pendientes.
- **Integración WhatsApp**: Conexión con servicio WAHA para envío de mensajes directos.
- **Plantillas IA**: Generación de mensajes personalizados (tono amigable/profesional).

## 6. Inteligencia Artificial (Gemini)
- **Análisis Ejecutivo**: Generación de resúmenes sobre el estado del gimnasio y recomendaciones de retención.
- **Identificación Facial**: Módulo experimental para identificar socios mediante fotos.
- **Asistente de Redacción**: Creación automática de recordatorios de cobro.

## 7. Infraestructura y Diseño
- **Multi-Rol**: Sistema de permisos dinámico (Super Admin, Admin, Instructor, Nutriólogo, Miembro).
- **Diseño Premium**: Interfaz moderna con animaciones (Framer Motion) e iconos (Lucide React).
- **Mobile Ready**: Preparado para compilación nativa Android/iOS vía Capacitor.
- **Modo PWA**: Configurado para funcionar como aplicación instalable.
