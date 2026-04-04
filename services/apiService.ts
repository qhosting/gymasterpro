// Use current origin but on port 3001 for development, or /api for production
import { saveData, getData, saveItem } from './offlineService';

const API_URL = typeof window !== 'undefined'
    ? (window.location.port === '3000' ? `${window.location.protocol}//${window.location.hostname}:3001/api` : '/api')
    : '/api';

export const getHeaders = () => {
    const token = localStorage.getItem('gym-token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
};

export const login = async (credentials: any) => {
    const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    if (!response.ok) throw new Error('Credenciales inválidas');
    const data = await response.json();
    localStorage.setItem('gym-token', data.token);
    return data;
};

export const getMe = async () => {
    const response = await fetch(`${API_URL}/me`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Session expired');
    return await response.json();
};

export const logout = () => {
    localStorage.removeItem('gym-token');
};

export const fetchMembers = async () => {
    try {
        const response = await fetch(`${API_URL}/members`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch members');
        const data = await response.json();
        // Sync to offline storage
        await saveData('members', data);
        return data;
    } catch (error) {
        console.warn("Offline? Fetching members from IDB");
        return await getData('members');
    }
};

export const createMember = async (memberData: any) => {
    const response = await fetch(`${API_URL}/members`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(memberData)
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to create member');
    }
    return await response.json();
};

export const updateMember = async (id: string, memberData: any) => {
    const response = await fetch(`${API_URL}/members/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(memberData)
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update member');
    }
    return await response.json();
};

export const deleteMember = async (id: string) => {
    const response = await fetch(`${API_URL}/members/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete member');
    return await response.json();
};

export const fetchPlans = async () => {
    try {
        const response = await fetch(`${API_URL}/plans`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch plans');
        const data = await response.json();
        await saveData('plans', data);
        return data;
    } catch (error) {
        console.warn("Offline? Fetching plans from IDB");
        return await getData('plans');
    }
};

export const recordCheckIn = async (memberId: string) => {
    const response = await fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ memberId })
    });
    if (!response.ok) throw new Error('Failed to record check-in');
    return await response.json();
};

export const recordCheckOut = async (attendanceId: string) => {
    const response = await fetch(`${API_URL}/attendance/${attendanceId}`, {
        method: 'PUT',
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to record check-out');
    return await response.json();
};

export const fetchTodayAttendance = async () => {
    const response = await fetch(`${API_URL}/attendance/today`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch attendance');
    return await response.json();
};

export const recordTransaction = async (transactionData: any) => {
    const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(transactionData)
    });
    if (!response.ok) throw new Error('Failed to record transaction');
    return await response.json();
};

export const processOpenpayPayment = async (paymentData: any) => {
    const response = await fetch(`${API_URL}/payments/openpay`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(paymentData)
    });
    if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || 'Openpay transaction failed');
    }
    return await response.json();
};

export const fetchTransactions = async () => {
    try {
        const response = await fetch(`${API_URL}/transactions`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch transactions');
        const data = await response.json();
        await saveData('transactions', data);
        return data;
    } catch (error) {
        console.warn("Offline? Fetching transactions from IDB");
        return await getData('transactions');
    }
};

export const fetchAttendanceStats = async () => {
    const response = await fetch(`${API_URL}/stats/attendance`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch attendance stats');
    return await response.json();
};

export const uploadFile = async (file: File) => {
    const formData = new FormData();
    formData.append('foto', file);
    
    const token = localStorage.getItem('gym-token');
    const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: formData
    });
    
    if (!response.ok) throw new Error('Failed to upload file');
    return await response.json();
};

export const fetchFullNutritionData = async (memberId: string) => {
    const response = await fetch(`${API_URL}/nutrition/data/${memberId}`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch nutrition data');
    return await response.json();
};

export const createMetrics = async (metricsData: any) => {
    const response = await fetch(`${API_URL}/nutrition/metrics`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(metricsData)
    });
    if (!response.ok) throw new Error('Failed to create metrics');
    return await response.json();
};

export const fetchAppointments = async (memberId?: string) => {
    const url = memberId ? `${API_URL}/nutrition/appointments?memberId=${memberId}` : `${API_URL}/nutrition/appointments`;
    try {
        const response = await fetch(url, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch appointments');
        const data = await response.json();
        // Since we don't have a separate store for filtering, just save all for now or skip sync if too complex
        // For now, let's just use the basic fetch
        return data;
    } catch (error) {
        return [];
    }
};

export const createAppointment = async (appointmentData: any) => {
    const response = await fetch(`${API_URL}/nutrition/appointments`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(appointmentData)
    });
    if (!response.ok) throw new Error('Failed to create appointment');
    return await response.json();
};

export const fetchRoutines = async (memberId: string) => {
    const response = await fetch(`${API_URL}/training/routines/${memberId}`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch routines');
    return await response.json();
};

export const createRoutine = async (routineData: any) => {
    const response = await fetch(`${API_URL}/training/routines`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(routineData)
    });
    if (!response.ok) throw new Error('Failed to create routine');
    return await response.json();
};

export const generateSmartRoutine = async (memberId: string, objetivo: string) => {
    const response = await fetch(`${API_URL}/training/generate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ memberId, objetivo })
    });
    if (!response.ok) throw new Error('Failed to generate routine');
    return await response.json();
};

export const fetchRankings = async () => {
    const response = await fetch(`${API_URL}/community/rankings`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch rankings');
    return await response.json();
};

export const fetchFullProfile = async (id: string) => {
    const response = await fetch(`${API_URL}/member/profile/${id}`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch profile');
    return await response.json();
};

export const updateMemberSettings = async (id: string, settings: any) => {
    const response = await fetch(`${API_URL}/member/settings/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return await response.json();
};

export const fetchSystemSettings = async () => {
    try {
        const response = await fetch(`${API_URL}/settings`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch system settings');
        const data = await response.json();
        // Settings is usually a single object, but we store it as an array or specific ID
        await saveData('settings', [data]); 
        return data;
    } catch (error) {
        console.warn("Offline? Fetching settings from IDB");
        const stored = await getData('settings');
        return stored[0] || null;
    }
};

export const updateSystemSettings = async (settings: any) => {
    const response = await fetch(`${API_URL}/settings`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Failed to update system settings');
    return await response.json();
};

export const fetchStaff = async () => {
    try {
        const response = await fetch(`${API_URL}/staff`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch staff');
        const data = await response.json();
        // Option to add 'staff' store if needed, but for now just fallback to empty
        return data;
    } catch (error) {
        return [];
    }
};

// --- PLANES CRUD ---
export const createPlan = async (planData: any) => {
    const response = await fetch(`${API_URL}/plans`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(planData)
    });
    if (!response.ok) throw new Error('Failed to create plan');
    return await response.json();
};

export const updatePlan = async (id: string, planData: any) => {
    const response = await fetch(`${API_URL}/plans/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(planData)
    });
    if (!response.ok) throw new Error('Failed to update plan');
    return await response.json();
};

export const deletePlan = async (id: string) => {
    const response = await fetch(`${API_URL}/plans/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to delete plan');
    return await response.json();
};

// --- NOTIFICACIONES ---
export const fetchNotifications = async () => {
    try {
        const response = await fetch(`${API_URL}/notifications`, {
            headers: getHeaders()
        });
        if (!response.ok) throw new Error('Failed to fetch notifications');
        const data = await response.json();
        await saveData('notifications', data);
        return data;
    } catch (error) {
        console.warn("Offline? Fetching notifications from IDB");
        return await getData('notifications');
    }
};

export const createNotificationLog = async (notifData: any) => {
    const response = await fetch(`${API_URL}/notifications`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(notifData)
    });
    if (!response.ok) throw new Error('Failed to save notification');
    return await response.json();
};

export const markNotificationAsRead = async (id: string, read: boolean = true) => {
    const response = await fetch(`${API_URL}/notifications/${id}`, {
        method: 'PATCH',
        headers: getHeaders(),
        body: JSON.stringify({ read })
    });
    if (!response.ok) throw new Error('Failed to update notification');
    return await response.json();
};
export const fetchClasses = async () => {
    const response = await fetch(`${API_URL}/classes`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch classes');
    return await response.json();
};

export const fetchGyms = async () => {
    const response = await fetch(`${API_URL}/gyms`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch gyms');
    return await response.json();
};

export const fetchMyBookings = async () => {
    const response = await fetch(`${API_URL}/classes/my-bookings`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch my bookings');
    return await response.json();
};

export const bookClass = async (classId: string, fecha: string) => {
    const response = await fetch(`${API_URL}/classes/book`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ classId, fecha })
    });
    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to book class');
    }
    return await response.json();
};

export const cancelBooking = async (bookingId: string) => {
    const response = await fetch(`${API_URL}/classes/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to cancel booking');
    return await response.json();
};
