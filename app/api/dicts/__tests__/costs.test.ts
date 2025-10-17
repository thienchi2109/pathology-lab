import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client before importing the route
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
};

const mockCreateClient = vi.fn().mockResolvedValue(mockSupabase);

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}));

// Import after mocking
const { GET } = await import('../costs/route');

describe('GET /api/dicts/costs', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockResolvedValue(mockSupabase);
  });

  it('should return costs successfully', async () => {
    const mockData = [
      { 
        id: '1', 
        price: 100000,
        effective_from: '2024-01-01',
        is_active: true,
        kit_type: { id: 'kt1', code: 'KT1', name: 'Kit Type 1' },
        sample_type: { id: 'st1', code: 'ST1', name: 'Sample Type 1' }
      },
      { 
        id: '2', 
        price: 150000,
        effective_from: '2024-02-01',
        is_active: true,
        kit_type: { id: 'kt2', code: 'KT2', name: 'Kit Type 2' },
        sample_type: { id: 'st2', code: 'ST2', name: 'Sample Type 2' }
      },
    ];

    mockSupabase.order.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual(mockData);
    expect(mockSupabase.from).toHaveBeenCalledWith('cost_catalog');
    expect(mockSupabase.select).toHaveBeenCalledWith(`
        *,
        kit_type:kit_types(id, code, name),
        sample_type:sample_types(id, code, name)
      `);
    expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true);
    expect(mockSupabase.order).toHaveBeenCalledWith('effective_from', { ascending: false });
  });

  it('should include kit_type and sample_type relationships', async () => {
    const mockData = [
      { 
        id: '1', 
        price: 100000,
        effective_from: '2024-01-01',
        is_active: true,
        kit_type: { id: 'kt1', code: 'KT1', name: 'Kit Type 1' },
        sample_type: { id: 'st1', code: 'ST1', name: 'Sample Type 1' }
      },
    ];

    mockSupabase.order.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const response = await GET();
    const json = await response.json();

    expect(json.data[0].kit_type).toBeDefined();
    expect(json.data[0].sample_type).toBeDefined();
    expect(json.data[0].kit_type.name).toBe('Kit Type 1');
    expect(json.data[0].sample_type.name).toBe('Sample Type 1');
  });

  it('should return only active costs', async () => {
    const mockData = [
      { 
        id: '1', 
        price: 100000,
        effective_from: '2024-01-01',
        is_active: true,
        kit_type: { id: 'kt1', code: 'KT1', name: 'Kit Type 1' },
        sample_type: { id: 'st1', code: 'ST1', name: 'Sample Type 1' }
      },
    ];

    mockSupabase.order.mockResolvedValue({
      data: mockData,
      error: null,
    });

    await GET();

    expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true);
  });

  it('should order costs by effective_from descending', async () => {
    const mockData = [
      { 
        id: '2', 
        price: 150000,
        effective_from: '2024-02-01',
        is_active: true,
        kit_type: { id: 'kt1', code: 'KT1', name: 'Kit Type 1' },
        sample_type: { id: 'st1', code: 'ST1', name: 'Sample Type 1' }
      },
      { 
        id: '1', 
        price: 100000,
        effective_from: '2024-01-01',
        is_active: true,
        kit_type: { id: 'kt1', code: 'KT1', name: 'Kit Type 1' },
        sample_type: { id: 'st1', code: 'ST1', name: 'Sample Type 1' }
      },
    ];

    mockSupabase.order.mockResolvedValue({
      data: mockData,
      error: null,
    });

    await GET();

    expect(mockSupabase.order).toHaveBeenCalledWith('effective_from', { ascending: false });
  });

  it('should handle database errors', async () => {
    mockSupabase.order.mockResolvedValue({
      data: null,
      error: new Error('Database connection failed'),
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Không thể tải danh sách giá');
  });

  it('should return empty array when no costs exist', async () => {
    mockSupabase.order.mockResolvedValue({
      data: [],
      error: null,
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual([]);
  });
});
