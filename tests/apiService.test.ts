import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchMembers } from '../services/apiService';

// Mock de fetch global
global.fetch = vi.fn();

describe('apiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('fetchMembers debe retornar datos cuando la respuesta es ok', async () => {
    const mockMembers = [{ id: '1', nombre: 'Juan' }];
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockMembers,
    });

    localStorage.setItem('gym-token', 'fake-token');
    const result = await fetchMembers();

    expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/members'), expect.any(Object));
    expect(result).toEqual(mockMembers);
  });

  it('fetchMembers debe lanzar error cuando la respuesta no es ok', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
    });

    localStorage.setItem('gym-token', 'fake-token');
    await expect(fetchMembers()).rejects.toThrow('Failed to fetch members');
  });
});
