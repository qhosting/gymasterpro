
import { GoogleGenAI } from "@google/genai";

// Función para obtener el resumen analítico del gimnasio
export const getGymAnalyticsSummary = async (membersData: any) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Actúa como un experto consultor de negocios para gimnasios. 
  Analiza los siguientes datos de miembros y proporciona un resumen ejecutivo en español de máximo 150 palabras.
  Incluye recomendaciones para retención de miembros.
  Datos: ${JSON.stringify(membersData)}`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "No se pudo generar el análisis en este momento.";
  } catch (error) {
    console.error("Error calling Gemini:", error);
    return "Error al generar el análisis. Por favor, intente más tarde.";
  }
};

// Función para generar plantillas de notificación
export const generateNotificationTemplate = async (type: string, memberName: string, tone: string = 'amigable') => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `Escribe un mensaje de WhatsApp corto y profesional en español para un miembro de gimnasio llamado ${memberName}.
  Motivo: ${type}. 
  Tono deseado: ${tone}. 
  Instrucciones: Usa emojis, incluye un llamado a la acción claro y no excedas los 60 palabras. Evita sonar como spam.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || `Hola ${memberName}, te recordamos que tu membresía por ${type} está pendiente. ¡Te esperamos en el gym! 🏋️‍♂️`;
  } catch (error) {
    console.error("Error generating notification template:", error);
    return `Hola ${memberName}, te recordamos que tu membresía por ${type} está pendiente. ¡Te esperamos en el gym! 🏋️‍♂️`;
  }
};

// Nueva función: Identificación Facial Inteligente
export const identifyMemberByFace = async (base64Image: string, members: any[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Preparamos una descripción ligera de los miembros para que la IA sepa a quién buscar
  const membersContext = members.map(m => ({
    id: m.id,
    nombre: m.nombre,
    fotoUrl: m.foto // URL de referencia
  }));

  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image.split(',')[1], // Quitar el prefijo data:image/jpeg;base64,
    },
  };

  const textPart = {
    text: `Analiza la imagen de este socio e identifícalo comparándolo con la base de datos de miembros proporcionada.
    
    Base de datos de miembros (ID y Nombre):
    ${JSON.stringify(membersContext)}

    Instrucciones:
    1. Si encuentras una coincidencia clara basándote en rasgos faciales, devuelve únicamente el ID del miembro.
    2. Si no estás seguro o no hay coincidencia, devuelve "UNKNOWN".
    3. No añadas explicaciones, solo el ID o "UNKNOWN".`
  };

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [imagePart, textPart] },
    });
    return response.text?.trim() || "UNKNOWN";
  } catch (error) {
    console.error("Error en identificación facial:", error);
    return "UNKNOWN";
  }
};
