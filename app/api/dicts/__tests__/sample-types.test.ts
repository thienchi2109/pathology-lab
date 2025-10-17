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
const { GET } = await import('../sample-types/route');

describe('GET /api/dicts/sample-types', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockResolvedValue(mockSupabase);
  });

  it('should return sample types successfully', async () => {
    const mockData = [
      { id: '1', name: 'Sample Type 1', code: 'ST1', is_active: true },
      { id: '2', name: 'Sample Type 2', code: 'ST2', is_active: true },
    ];

    mockSupabase.order.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual(mockData);
    expect(mockSupabase.from).toHaveBeenCalledWith('sample_types');
    expect(mockSupabase.select).toHaveBeenCalledWith('*');
    expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true);
    expect(mockSupabase.order).toHaveBeenCalledWith('name');
  });

  it('should return only active sample types', async () => {
    const mockData = [
      { id: '1', name: 'Active Sample Type', code: 'AST', is_active: true },
    ];

    mockSupabase.order.mockResolvedValue({
      data: mockData,
      error: null,
    });

    await GET();

    expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true);
  });

  it('should handle database errors', async () => {
    mockSupabase.order.mockResolvedValue({
      data: null,
      error: new Error('Database connection failed'),
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Không thể tải danh sách loại mẫu');
  });

  it('should return empty array when no sample types exist', async () => {
    mockSupabase.order.mockResolvedValue({
      data: [],
      error: null,
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual([]);
  });

  it('should order sample types by name', async () => {
    const mockData = [
      { id: '1', name: 'Alpha Sample', code: 'AS', is_active: true },
      { id: '2', name: 'Beta Sample', code: 'BS', is_active: true },
    ];

    mockSupabase.order.mockResolvedValue({
      data: mockData,
      error: null,
    });

    await GET();

    expect(mockSupabase.order).toHaveBeenCalledWith('name');
  });
});
