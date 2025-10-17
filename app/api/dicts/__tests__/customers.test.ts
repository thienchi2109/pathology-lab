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
const { GET } = await import('../customers/route');

describe('GET /api/dicts/customers', () => {
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

  it('should return customers successfully without search', async () => {
    const mockData = [
      { 
        id: '1', 
        name: 'Customer A', 
        code: 'CA', 
        email: 'customer.a@example.com',
        is_active: true,
        company: { id: 'c1', name: 'Company 1' }
      },
      { 
        id: '2', 
        name: 'Customer B', 
        code: 'CB', 
        email: 'customer.b@example.com',
        is_active: true,
        company: { id: 'c2', name: 'Company 2' }
      },
    ];

    mockSupabase.order.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/dicts/customers');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual(mockData);
    expect(mockSupabase.from).toHaveBeenCalledWith('customers');
    expect(mockSupabase.select).toHaveBeenCalledWith('*, company:companies(id, name)');
    expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true);
    expect(mockSupabase.order).toHaveBeenCalledWith('name');
  });

  it('should include company relationship in response', async () => {
    const mockData = [
      { 
        id: '1', 
        name: 'Customer A', 
        code: 'CA',
        email: 'test@example.com',
        is_active: true,
        company: { id: 'c1', name: 'Company 1' }
      },
    ];

    mockSupabase.order.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/dicts/customers');
    const response = await GET(request);
    const json = await response.json();

    expect(json.data[0].company).toBeDefined();
    expect(json.data[0].company.name).toBe('Company 1');
  });

  it('should filter customers by search query', async () => {
    const mockData = [
      { 
        id: '1', 
        name: 'Test Customer', 
        code: 'TC',
        email: 'test@example.com',
        is_active: true,
        company: { id: 'c1', name: 'Company 1' }
      },
    ];

    // For search, the final call is .or() which should resolve with data
    mockSupabase.or.mockResolvedValueOnce({
      data: mockData,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/dicts/customers?search=Test');
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

    const request = new Request('http://localhost:3000/api/dicts/customers?search=NonExistent');
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

    const request = new Request('http://localhost:3000/api/dicts/customers');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Không thể tải danh sách khách hàng');
  });

  it('should return only active customers', async () => {
    const mockData = [
      { 
        id: '1', 
        name: 'Active Customer', 
        code: 'AC',
        email: 'active@example.com',
        is_active: true,
        company: { id: 'c1', name: 'Company 1' }
      },
    ];

    mockSupabase.order.mockResolvedValue({
      data: mockData,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/dicts/customers');
    await GET(request);

    expect(mockSupabase.eq).toHaveBeenCalledWith('is_active', true);
  });
});
