const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api' 
    : '/api';

const getHeaders = () => {
    const token = localStorage.getItem('gym-token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

// Función para obtener el resumen analítico del gimnasio
export const getGymAnalyticsSummary = async (membersData: any) => {
  const prompt = `Actúa como un experto consultor de negocios para gimnasios. 
  Analiza los siguientes datos de miembros y proporciona un resumen ejecutivo en español de máximo 150 palabras.
  Incluye recomendaciones para retención de miembros.
  Datos: ${JSON.stringify(membersData)}`;

  try {
    const response = await fetch(`${API_URL}/ai/process`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    return data.text || "No se pudo generar el análisis en este momento.";
  } catch (error) {
    console.error("Error calling Gemini via backend:", error);
    return "Error al generar el análisis. Por favor, intente más tarde.";
  }
};

// Función para generar plantillas de notificación
export const generateNotificationTemplate = async (type: string, memberName: string, tone: string = 'amigable') => {
  const prompt = `Escribe un mensaje de WhatsApp corto y profesional en español para un miembro de gimnasio llamado ${memberName}.
  Motivo: ${type}. 
  Tono deseado: ${tone}. 
  Instrucciones: Usa emojis, incluye un llamado a la acción claro y no excedas los 60 palabras. Evita sonar como spam.`;
  
  try {
    const response = await fetch(`${API_URL}/ai/process`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ prompt })
    });
    const data = await response.json();
    return data.text || `Hola ${memberName}, te recordamos que tu membresía por ${type} está pendiente. ¡Te esperamos en el gym! 🏋️‍♂️`;
  } catch (error) {
    console.error("Error generating notification template via backend:", error);
    return `Hola ${memberName}, te recordamos que tu membresía por ${type} está pendiente. ¡Te esperamos en el gym! 🏋️‍♂️`;
  }
};

// Nueva función: Identificación Facial Inteligente (con Soporte para Comparación de Referencias)
export const identifyMemberByFace = async (base64Image: string, members: any[]) => {
  // Solo enviamos miembros que tengan foto para poder compararlos
  const candidates = members
    .filter(m => m.foto && m.foto.startsWith('data:')) // Solo los que tienen foto Base64 local
    .slice(0, 15); // Máximo 15 referencias para optimizar latencia

  const membersContext = candidates.map(m => ({
    id: m.id,
    nombre: m.nombre
  }));

  const additionalImages = candidates.map(m => m.foto);

  const prompt = `Identify the member in Image 0 (Captured Face) by comparing it with the reference profile pictures provided in the subsequent images (Images 1 to ${additionalImages.length}).
  
  The candidates are (in order from Image 1):
  ${membersContext.map((m, i) => `${i + 1}. ID: ${m.id} (${m.nombre})`).join('\n')}
  
  Return ONLY the member's ID string if a clear visual match is found, otherwise return 'UNKNOWN'. Do not include any text, numbers, or punctuation outside the ID itself.`;

  try {
    const response = await fetch(`${API_URL}/ai/process`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ 
          prompt, 
          type: 'vision', 
          base64Image, 
          additionalImages 
        })
    });
    const data = await response.json();
    const resultId = data.text?.trim() || "UNKNOWN";
    
    // Validar que el ID devuelto sea uno de nuestros candidatos
    return members.some(m => m.id === resultId) ? resultId : "UNKNOWN";
  } catch (error) {
    console.error("Error en identificación facial via backend:", error);
    return "UNKNOWN";
  }
};
