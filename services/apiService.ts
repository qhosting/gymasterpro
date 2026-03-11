// Use relative URL in production to talk to the same host
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

export const fetchMemberMetrics = async (memberId: string) => {
    const response = await fetch(`${API_URL}/nutrition/metrics/${memberId}`, {
        headers: getHeaders()
    });
    if (!response.ok) throw new Error('Failed to fetch metrics');
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
