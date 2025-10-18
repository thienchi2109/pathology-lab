import { describe, it, expect, vi, beforeEach } from 'vitest';

// Valid UUID for testing
const VALID_KIT_TYPE_UUID = '550e8400-e29b-41d4-a716-446655440000';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
  in: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
};

const mockCreateClient = vi.fn().mockResolvedValue(mockSupabase);

vi.mock('@/lib/supabase/server', () => ({
  createClient: mockCreateClient,
}));

// Mock auth
const mockRequireEditor = vi.fn().mockResolvedValue({
  id: 'user-123',
  email: 'editor@lab.local',
  role: 'editor',
});

vi.mock('@/lib/auth/server', () => ({
  requireEditor: mockRequireEditor,
}));

// Import after mocking
const { POST } = await import('../bulk-adjust/route');

describe('POST /api/kits/bulk-adjust', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    mockSupabase.in.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.insert.mockReturnValue(mockSupabase);
    mockSupabase.single.mockReturnValue(mockSupabase);
    mockSupabase.limit.mockReturnValue(mockSupabase);
    
    mockCreateClient.mockResolvedValue(mockSupabase);
    mockRequireEditor.mockResolvedValue({
      id: 'user-123',
      email: 'editor@lab.local',
      role: 'editor',
    });
  });

  it('should adjust stock successfully with positive delta', async () => {
    const mockBatches = [{ id: 'batch-1' }, { id: 'batch-2' }];
    const mockKits = [
      { id: 'kit-1', batch_id: 'batch-1' },
      { id: 'kit-2', batch_id: 'batch-1' },
      { id: 'kit-3', batch_id: 'batch-2' },
    ];

    // Mock batch query
    mockSupabase.select.mockResolvedValueOnce({
      data: mockBatches,
      error: null,
    });

    // Mock count query (head: true returns count)
    mockSupabase.in.mockResolvedValueOnce({
      count: 10,
      error: null,
    });

    // Mock kits to adjust (void/lost kits to return to stock)
    mockSupabase.limit.mockResolvedValueOnce({
      data: mockKits,
      error: null,
    });

    // Mock update
    mockSupabase.in.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    // Mock audit log
    mockSupabase.insert.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/kits/bulk-adjust', {
      method: 'POST',
      body: JSON.stringify({
        kit_type_id: VALID_KIT_TYPE_UUID,
        delta: 3,
        reason: 'Returned to stock',
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.adjusted).toBe(3);
    expect(json.data.new_stock).toBe(13);
  });

  it('should reject negative delta exceeding available stock', async () => {
    const mockBatches = [{ id: 'batch-1' }];

    // Mock batch query
    mockSupabase.select.mockResolvedValueOnce({
      data: mockBatches,
      error: null,
    });

    // Mock count query - only 5 kits available
    mockSupabase.in.mockResolvedValueOnce({
      count: 5,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/kits/bulk-adjust', {
      method: 'POST',
      body: JSON.stringify({
        kit_type_id: VALID_KIT_TYPE_UUID,
        delta: -10,
        reason: 'Damaged kits',
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.error).toContain('Chuyển quá số lượng tồn kho');
  });

  it('should handle zero delta', async () => {
    const mockBatches = [{ id: 'batch-1' }];

    // Mock batch query
    mockSupabase.select.mockResolvedValueOnce({
      data: mockBatches,
      error: null,
    });

    // Mock count query
    mockSupabase.in.mockResolvedValueOnce({
      count: 10,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/kits/bulk-adjust', {
      method: 'POST',
      body: JSON.stringify({
        kit_type_id: VALID_KIT_TYPE_UUID,
        delta: 0,
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    // Delta 0 is valid - returns current stock
    expect(response.status).toBe(200);
    expect(json.data.adjusted).toBe(0);
    expect(json.data.new_stock).toBe(10);
  });

  it('should validate required fields', async () => {
    const request = new Request('http://localhost:3000/api/kits/bulk-adjust', {
      method: 'POST',
      body: JSON.stringify({
        delta: 5,
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(422);
    expect(json.error).toBeDefined();
  });

  it('should handle negative delta within available stock', async () => {
    const mockBatches = [{ id: 'batch-1' }];
    const mockKits = [
      { id: 'kit-1', batch_id: 'batch-1' },
      { id: 'kit-2', batch_id: 'batch-1' },
    ];

    // Mock batch query
    mockSupabase.select.mockResolvedValueOnce({
      data: mockBatches,
      error: null,
    });

    // Mock count query - 10 kits available
    mockSupabase.in.mockResolvedValueOnce({
      count: 10,
      error: null,
    });

    // Mock kits to void
    mockSupabase.limit.mockResolvedValueOnce({
      data: mockKits,
      error: null,
    });

    // Mock update
    mockSupabase.in.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    // Mock audit log
    mockSupabase.insert.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/kits/bulk-adjust', {
      method: 'POST',
      body: JSON.stringify({
        kit_type_id: VALID_KIT_TYPE_UUID,
        delta: -2,
        reason: 'Damaged',
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.adjusted).toBe(2);
    expect(json.data.new_stock).toBe(8);
  });

  it('should handle database errors gracefully', async () => {
    mockSupabase.select.mockResolvedValueOnce({
      data: null,
      error: new Error('Database error'),
    });

    const request = new Request('http://localhost:3000/api/kits/bulk-adjust', {
      method: 'POST',
      body: JSON.stringify({
        kit_type_id: VALID_KIT_TYPE_UUID,
        delta: 5,
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json.error).toBe('Đã xảy ra lỗi, vui lòng thử lại');
  });

  it('should handle unauthorized access', async () => {
    mockRequireEditor.mockRejectedValueOnce(new Error('Unauthorized'));

    const request = new Request('http://localhost:3000/api/kits/bulk-adjust', {
      method: 'POST',
      body: JSON.stringify({
        kit_type_id: 'type-123',
        delta: 5,
        target_status: 'void',
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json.error).toBe('Vui lòng đăng nhập');
  });

  it('should handle forbidden access for viewers', async () => {
    mockRequireEditor.mockRejectedValueOnce(
      new Error('Bạn không có quyền thực hiện thao tác này')
    );

    const request = new Request('http://localhost:3000/api/kits/bulk-adjust', {
      method: 'POST',
      body: JSON.stringify({
        kit_type_id: 'type-123',
        delta: 5,
        target_status: 'void',
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toBe('Bạn không có quyền thực hiện thao tác này');
  });

  it('should log audit trail on success', async () => {
    const mockBatches = [{ id: 'batch-1' }];
    const mockKits = [{ id: 'kit-1', batch_id: 'batch-1' }];

    mockSupabase.select.mockResolvedValueOnce({
      data: mockBatches,
      error: null,
    });

    mockSupabase.in.mockResolvedValueOnce({
      count: 10,
      error: null,
    });

    mockSupabase.limit.mockResolvedValueOnce({
      data: mockKits,
      error: null,
    });

    mockSupabase.in.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    mockSupabase.insert.mockResolvedValue({
      data: null,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/kits/bulk-adjust', {
      method: 'POST',
      body: JSON.stringify({
        kit_type_id: VALID_KIT_TYPE_UUID,
        delta: -1,
        reason: 'Test',
      }),
    });

    await POST(request);

    // Verify insert was called for audit log
    expect(mockSupabase.insert).toHaveBeenCalled();
  });
});
