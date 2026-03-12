
export interface WhatsAppTemplate {
  id: string;
  name: string;
  category: 'registro' | 'vencimiento' | 'pago' | 'promocion' | 'nutricion' | 'rutina';
  content: string;
}

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
  {
    id: 'welcome',
    name: 'Bienvenida Nuevo Socio',
    category: 'registro',
    content: '¡Hola {nombre}! 🏋️‍♂️ Te damos la más cordial bienvenida a *GymMaster Pro*. Estamos muy felices de que te unas a nuestra familia. Ya puedes acceder a la App para ver tus rutinas y progreso. ¡A darle con todo! 💪'
  },
  {
    id: 'expiration_warning',
    name: 'Aviso de Próximo Vencimiento',
    category: 'vencimiento',
    content: 'Hola {nombre}, te recordamos que tu plan de gimnasio vencerá el próximo {fecha}. 🗓️ Para evitar interrupciones en tu entrenamiento, puedes renovar hoy mismo en recepción o vía transferencia. ¡No pierdas el ritmo! 🔥'
  },
  {
    id: 'payment_confirmation',
    name: 'Confirmación de Pago',
    category: 'pago',
    content: '¡Muchas gracias {nombre}! Confirmamos la recepción de tu pago por ${monto}. ✅ Tu membresía ha sido actualizada correctamente hasta el {nueva_fecha}. ¡Gracias por ser parte de GymMaster Pro! 🚀'
  },
  {
    id: 'reengagement',
    name: 'Re-activación (Socio Vencido)',
    category: 'promocion',
    content: '¡Te extrañamos {nombre}! 🥺 Notamos que hace poco venció tu membresía. Queremos que regreses, por eso tenemos una promoción especial para ti si renuevas esta semana. 🎁 ¡Vuelve a entrenar con nosotros!'
  },
  {
    id: 'nutrition_reminder',
    name: 'Recordatorio Cita Nutrición',
    category: 'nutricion',
    content: 'Hola {nombre}, te recordamos tu cita con nuestro nutriólogo mañana a las {hora}. 🍏 Por favor llega 5 minutos antes. ¡Tu alimentación es la clave del éxito! 🥗'
  },
  {
    id: 'routine_assigned',
    name: 'Nueva Rutina Asignada',
    category: 'rutina',
    content: '¡Hola {nombre}! Tu instructor ha actualizado tu plan de entrenamiento. 🏋️‍♀️ Ya puedes consultar tu nueva rutina en la sección "Mi Entrenamiento" de la App. ¡Vamos por esos objetivos! 🎯'
  }
];
