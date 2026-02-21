
import { WahaConfig } from '../types';

export const sendWahaMessage = async (config: WahaConfig, phone: string, text: string) => {
  if (!config.apiUrl) throw new Error("WAHA API URL no configurada");

  // Formatear número para WAHA (ej: 5215512345678@c.us)
  const chatId = phone.includes('@') ? phone : `${phone.replace('+', '')}@c.us`;

  try {
    const response = await fetch(`${config.apiUrl}/api/sendText`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': config.apiKey,
      },
      body: JSON.stringify({
        chatId: chatId,
        text: text,
        session: config.session || 'default',
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Error al enviar mensaje vía WAHA");
    }

    return await response.json();
  } catch (error) {
    console.error("WAHA Service Error:", error);
    throw error;
  }
};

export const checkWahaStatus = async (config: WahaConfig) => {
  try {
    const response = await fetch(`${config.apiUrl}/api/sessions/${config.session || 'default'}`, {
      headers: { 'X-Api-Key': config.apiKey }
    });
    return response.ok;
  } catch {
    return false;
  }
};
