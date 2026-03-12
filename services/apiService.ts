// Use current origin but on port 3001 for development, or /api for production
const API_URL = typeof window !== 'undefined'
    ? (window.location.port === '3000' ? `${window.location.protocol}//${window.location.hostname}:3001/api` : '/api')
    : '/api';

const getHeaders = () => {
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
    const response = await fetch(`${API_URL}/members`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch members');
    return await response.json();
};

export const createMember = async (memberData: any) => {
    const response = await fetch(`${API_URL}/members`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(memberData)
    });
    if (!response.ok) throw new Error('Failed to create member');
    return await response.json();
};

export const updateMember = async (id: string, memberData: any) => {
    const response = await fetch(`${API_URL}/members/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(memberData)
    });
    if (!response.ok) throw new Error('Failed to update member');
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
    const response = await fetch(`${API_URL}/plans`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch plans');
    return await response.json();
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
    const response = await fetch(`${API_URL}/transactions`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch transactions');
    return await response.json();
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
    const response = await fetch(url, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch appointments');
    return await response.json();
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
    const response = await fetch(`${API_URL}/settings`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch system settings');
    return await response.json();
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
    const response = await fetch(`${API_URL}/staff`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch staff');
    return await response.json();
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
    const response = await fetch(`${API_URL}/notifications`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch notifications');
    return await response.json();
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
