const API_URL = 'http://localhost:3001/api';

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
