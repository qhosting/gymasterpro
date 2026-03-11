// Use relative URL in production to talk to the same host
const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
    ? 'http://localhost:3001/api' 
    : '/api';

export const fetchMembers = async () => {
    const response = await fetch(`${API_URL}/members`);
    if (!response.ok) throw new Error('Failed to fetch members');
    return await response.json();
};

export const fetchPlans = async () => {
    const response = await fetch(`${API_URL}/plans`);
    if (!response.ok) throw new Error('Failed to fetch plans');
    return await response.json();
};
