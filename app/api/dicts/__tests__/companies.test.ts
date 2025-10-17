import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client before importing the route
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  order: vi.fn().mockReturnThis(),
  or: vi.fn().mockReturnThis(),
};

const mockCreateClient = vi.fn().mockResolvedValue(mockSupabase);

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}));

// Import after mocking
const { GET } = await import('../companies/route');

describe('GET /api/dicts/companies', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset all mock functions to return this for chaining
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.order.mockReturnValue(mockSupabase);
    mockSupabase.or.mockReturnValue(mockSupabase);
    
    mockCreateClient.mockResolvedValue(mockSupabase);
  });

  it('should return companies successfully without search', async () => {
    const mockData = [
      { id: '1', name: 'Company A', code: 'CA', is_active: true },
      { id: '2', name: 'Company B', code: 'CB', is_active: true },
    ];

    mockSupabase.order.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/dicts/companies');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual(mockData);
    expect(mockSupabase.from).toHaveBeenCalledWith('companies');
    expect(mockSupabase.select).toHaveBeenCalledWith('*');
    expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true);
    expect(mockSupabase.order).toHaveBeenCalledWith('name');
  });

  it('should filter companies by search query', async () => {
    const mockData = [
      { id: '1', name: 'Test Company', code: 'TC', is_active: true },
    ];

    // For search, the final call is .or() which should resolve with data
    mockSupabase.or.mockResolvedValueOnce({
      data: mockData,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/dicts/companies?search=Test');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual(mockData);
    expect(json.data.length).toBeGreaterThan(0);
  });

  it('should handle empty search results', async () => {
    // For search, the final call is .or() which should resolve with data
    mockSupabase.or.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const request = new Request('http://localhost:3000/api/dicts/companies?search=NonExistent');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual([]);
  });

  it('should handle database errors', async () => {
    mockSupabase.order.mockResolvedValue({
      data: null,
      error: new Error('Database connection failed'),
    });

    const request = new Request('http://localhost:3000/api/dicts/companies');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Không thể tải danh sách công ty');
  });

  it('should return only active companies', async () => {
    const mockData = [
      { id: '1', name: 'Active Company', code: 'AC', is_active: true },
    ];

    mockSupabase.order.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/dicts/companies');
    await GET(request);

    expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true);
  });
});
