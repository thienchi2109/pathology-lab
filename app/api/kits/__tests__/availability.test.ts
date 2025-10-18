import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
};

const mockCreateClient = vi.fn().mockResolvedValue(mockSupabase);

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}));

// Mock auth - availability uses requireAuth (not requireEditor)
const mockRequireAuth = vi.fn().mockResolvedValue({
  id: 'user-123',
  email: 'user@lab.local',
  role: 'viewer',
});

vi.mock('@/lib/auth/server', () => ({
  requireAuth: mockRequireAuth,
}));

// Import after mocking
const { GET } = await import('../availability/route');

describe('GET /api/kits/availability', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.in.mockReturnValue(mockSupabase);
    
    mockCreateClient.mockResolvedValue(mockSupabase);
    mockRequireAuth.mockResolvedValue({
      id: 'user-123',
      email: 'user@lab.local',
      role: 'viewer',
    });
  });

  it('should return availability for all kit types', async () => {
    const mockData = [
      {
        status: 'in_stock',
        batch_id: 'batch-1',
        kit_batches: {
          id: 'batch-1',
          kit_type_id: 'type-1',
          batch_code: 'LOT-001',
          kit_types: { id: 'type-1', name: 'Type A', code: 'TA' },
        },
      },
      {
        status: 'used',
        batch_id: 'batch-1',
        kit_batches: {
          id: 'batch-1',
          kit_type_id: 'type-1',
          batch_code: 'LOT-001',
          kit_types: { id: 'type-1', name: 'Type A', code: 'TA' },
        },
      },
      {
        status: 'in_stock',
        batch_id: 'batch-2',
        kit_batches: {
          id: 'batch-2',
          kit_type_id: 'type-2',
          batch_code: 'LOT-002',
          kit_types: { id: 'type-2', name: 'Type B', code: 'TB' },
        },
      },
    ];

    mockSupabase.select.mockResolvedValueOnce({
      data: mockData,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/kits/availability');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toBeDefined();
    expect(Array.isArray(json.data)).toBe(true);
  });

  it('should filter by kit type when provided', async () => {
    const mockData = [
      {
        status: 'in_stock',
        batch_id: 'batch-1',
        kit_batches: {
          id: 'batch-1',
          kit_type_id: 'type-1',
          batch_code: 'LOT-001',
          kit_types: { id: 'type-1', name: 'Type A', code: 'TA' },
        },
      },
    ];

    mockSupabase.select.mockResolvedValueOnce({
      data: mockData,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/kits/availability?kit_type_id=type-1');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(mockSupabase.eq).toHaveBeenCalledWith('kit_batches.kit_type_id', 'type-1');
  });

  it('should return empty array when no kits match', async () => {
    mockSupabase.select.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    const request = new Request('http://localhost:3000/api/kits/availability?kit_type_id=nonexistent');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual([]);
  });

  it('should handle database errors', async () => {
    mockSupabase.select.mockResolvedValueOnce({
      data: null,
      error: new Error('Database connection failed'),
    });

    const request = new Request('http://localhost:3000/api/kits/availability');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Đã xảy ra lỗi, vui lòng thử lại');
  });

  it('should include kit type information in response', async () => {
    const mockData = [
      {
        status: 'in_stock',
        batch_id: 'batch-1',
        kit_batches: {
          id: 'batch-1',
          kit_type_id: 'type-1',
          batch_code: 'LOT-001',
          kit_types: {
            id: 'type-1',
            name: 'PCR Test Kit',
            code: 'PCR-001',
          },
        },
      },
    ];

    mockSupabase.select.mockResolvedValueOnce({
      data: mockData,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/kits/availability');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data[0].kit_type_name).toBe('PCR Test Kit');
  });

  it('should return aggregated counts by status', async () => {
    const mockData = [
      {
        status: 'in_stock',
        batch_id: 'batch-1',
        kit_batches: {
          id: 'batch-1',
          kit_type_id: 'type-1',
          batch_code: 'LOT-001',
          kit_types: { id: 'type-1', name: 'Type A', code: 'TA' },
        },
      },
      {
        status: 'in_stock',
        batch_id: 'batch-1',
        kit_batches: {
          id: 'batch-1',
          kit_type_id: 'type-1',
          batch_code: 'LOT-001',
          kit_types: { id: 'type-1', name: 'Type A', code: 'TA' },
        },
      },
      {
        status: 'used',
        batch_id: 'batch-1',
        kit_batches: {
          id: 'batch-1',
          kit_type_id: 'type-1',
          batch_code: 'LOT-001',
          kit_types: { id: 'type-1', name: 'Type A', code: 'TA' },
        },
      },
    ];

    mockSupabase.select.mockResolvedValueOnce({
      data: mockData,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/kits/availability?kit_type_id=type-1');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data[0].by_status.in_stock).toBe(2);
    expect(json.data[0].by_status.used).toBe(1);
    expect(json.data[0].total).toBe(3);
  });

  it('should handle query with no filters', async () => {
    const mockData = [
      {
        status: 'in_stock',
        batch_id: 'batch-1',
        kit_batches: {
          id: 'batch-1',
          kit_type_id: 'type-1',
          batch_code: 'LOT-001',
          kit_types: { id: 'type-1', name: 'Type A', code: 'TA' },
        },
      },
    ];

    mockSupabase.select.mockResolvedValueOnce({
      data: mockData,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/kits/availability');
    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.length).toBeGreaterThan(0);
  });
});
