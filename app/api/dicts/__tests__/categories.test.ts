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
const { GET } = await import('../categories/route');

describe('GET /api/dicts/categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreateClient.mockResolvedValue(mockSupabase);
  });

  it('should return categories successfully', async () => {
    const mockData = [
      { id: '1', name: 'Category A', code: 'CA', is_active: true },
      { id: '2', name: 'Category B', code: 'CB', is_active: true },
    ];

    mockSupabase.order.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual(mockData);
    expect(mockSupabase.from).toHaveBeenCalledWith('categories');
    expect(mockSupabase.select).toHaveBeenCalledWith('*');
    expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true);
    expect(mockSupabase.order).toHaveBeenCalledWith('name');
  });

  it('should return only active categories', async () => {
    const mockData = [
      { id: '1', name: 'Active Category', code: 'AC', is_active: true },
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
    expect(json.error).toBe('Không thể tải danh sách danh mục');
  });

  it('should return empty array when no categories exist', async () => {
    mockSupabase.order.mockResolvedValue({
      data: [],
      error: null,
    });

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual([]);
  });

  it('should order categories by name', async () => {
    const mockData = [
      { id: '1', name: 'Alpha', code: 'A', is_active: true },
      { id: '2', name: 'Beta', code: 'B', is_active: true },
    ];

    mockSupabase.order.mockResolvedValue({
      data: mockData,
      error: null,
    });

    await GET();

    expect(mockSupabase.order).toHaveBeenCalledWith('name');
  });
});
