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

export const sendWahaMessage = async (_config: any, phone: string, text: string) => {
  try {
    const response = await fetch(`${API_URL}/whatsapp/send`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ phone, text }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Error al enviar mensaje vía backend");
    }

    return await response.json();
  } catch (error) {
    console.error("WAHA Service Error via backend:", error);
    throw error;
  }
};

export const checkWahaStatus = async (_config: any) => {
  try {
    const response = await fetch(`${API_URL}/whatsapp/status`, {
      headers: getHeaders()
    });
    const data = await response.json();
    return data.online;
  } catch {
    return false;
  }
};
