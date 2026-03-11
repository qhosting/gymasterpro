// Use relative URL in production to talk to the same host
const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api' 
    : '/api';

export const fetchMembers = async () => {
    const response = await fetch(`${API_URL}/members`);
    if (!response.ok) throw new Error('Failed to fetch members');
    return await response.json();
};

export const createMember = async (memberData: any) => {
    const response = await fetch(`${API_URL}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData)
    });
    if (!response.ok) throw new Error('Failed to create member');
    return await response.json();
};

export const updateMember = async (id: string, memberData: any) => {
    const response = await fetch(`${API_URL}/members/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData)
    });
    if (!response.ok) throw new Error('Failed to update member');
    return await response.json();
};

export const deleteMember = async (id: string) => {
    const response = await fetch(`${API_URL}/members/${id}`, {
        method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete member');
    return await response.json();
};

export const fetchPlans = async () => {
    const response = await fetch(`${API_URL}/plans`);
    if (!response.ok) throw new Error('Failed to fetch plans');
    return await response.json();
};

export const recordCheckIn = async (memberId: string) => {
    const response = await fetch(`${API_URL}/attendance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId })
    });
    if (!response.ok) throw new Error('Failed to record check-in');
    return await response.json();
};

export const recordCheckOut = async (attendanceId: string) => {
    const response = await fetch(`${API_URL}/attendance/${attendanceId}`, {
        method: 'PUT'
    });
    if (!response.ok) throw new Error('Failed to record check-out');
    return await response.json();
};

export const fetchTodayAttendance = async () => {
    const response = await fetch(`${API_URL}/attendance/today`);
    if (!response.ok) throw new Error('Failed to fetch attendance');
    return await response.json();
};

export const recordTransaction = async (transactionData: any) => {
    const response = await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
    });
    if (!response.ok) throw new Error('Failed to record transaction');
    return await response.json();
};
