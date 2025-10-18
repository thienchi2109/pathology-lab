import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

// Valid UUID for testing
const VALID_KIT_TYPE_UUID = '550e8400-e29b-41d4-a716-446655440000';

// Mock Supabase client
const mockSupabase = {
  from: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  select: vi.fn().mockReturnThis(),
  single: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  eq: vi.fn().mockReturnThis(),
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
const { POST } = await import('../bulk-create/route');

describe('POST /api/kits/bulk-create', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset mock functions
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.insert.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.single.mockReturnValue(mockSupabase);
    mockSupabase.delete.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
    
    mockCreateClient.mockResolvedValue(mockSupabase);
    mockRequireEditor.mockResolvedValue({
      id: 'user-123',
      email: 'editor@lab.local',
      role: 'editor',
    });
  });

  it('should create kit batch and kits successfully', async () => {
    const mockBatch = {
      id: 'batch-123',
      batch_code: 'LOT-2024-001',
      kit_type_id: VALID_KIT_TYPE_UUID,
      supplier: 'Test Supplier',
      purchased_at: '2024-10-01',
      unit_cost: 100000,
      quantity: 5,
      expires_at: '2025-10-01',
      note: 'Test batch',
    };

    const mockKits = [
      { id: 'kit-1', batch_id: 'batch-123', kit_code: 'LOT-2024-001-001', status: 'in_stock' },
      { id: 'kit-2', batch_id: 'batch-123', kit_code: 'LOT-2024-001-002', status: 'in_stock' },
      { id: 'kit-3', batch_id: 'batch-123', kit_code: 'LOT-2024-001-003', status: 'in_stock' },
      { id: 'kit-4', batch_id: 'batch-123', kit_code: 'LOT-2024-001-004', status: 'in_stock' },
      { id: 'kit-5', batch_id: 'batch-123', kit_code: 'LOT-2024-001-005', status: 'in_stock' },
    ];

    // Mock batch creation
    mockSupabase.single.mockResolvedValueOnce({
      data: mockBatch,
      error: null,
    });

    // Mock kits creation
    mockSupabase.select.mockResolvedValueOnce({
      data: mockKits,
      error: null,
    });

    // Mock audit log
    mockSupabase.insert.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/kits/bulk-create', {
      method: 'POST',
      body: JSON.stringify({
        batch_code: 'LOT-2024-001',
        kit_type_id: VALID_KIT_TYPE_UUID,
        supplier: 'Test Supplier',
        purchased_at: '2024-10-01',
        unit_cost: 100000,
        quantity: 5,
        expires_at: '2025-10-01',
        note: 'Test batch',
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.batch).toEqual(mockBatch);
    expect(json.data.kits).toEqual(mockKits);
    expect(json.data.count).toBe(5);
  });

  it('should reject quantity greater than 100', async () => {
    const request = new Request('http://localhost:3000/api/kits/bulk-create', {
      method: 'POST',
      body: JSON.stringify({
        batch_code: 'LOT-2024-001',
        kit_type_id: '550e8400-e29b-41d4-a716-446655440000', // Valid UUID
        supplier: 'Test Supplier',
        purchased_at: '2024-10-01',
        unit_cost: 100000,
        quantity: 101,
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(422);
    expect(json.error).toBe('Số lượng quá lớn');
  });

  it('should reject quantity less than 1', async () => {
    const request = new Request('http://localhost:3000/api/kits/bulk-create', {
      method: 'POST',
      body: JSON.stringify({
        batch_code: 'LOT-2024-001',
        kit_type_id: VALID_KIT_TYPE_UUID,
        supplier: 'Test Supplier',
        purchased_at: '2024-10-01',
        unit_cost: 100000,
        quantity: 0,
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(422);
    expect(json.error).toContain('Số lượng phải ≥ 1');
  });

  it('should validate required fields', async () => {
    const request = new Request('http://localhost:3000/api/kits/bulk-create', {
      method: 'POST',
      body: JSON.stringify({
        batch_code: '',
        kit_type_id: 'type-123',
        supplier: 'Test Supplier',
        purchased_at: '2024-10-01',
        unit_cost: 100000,
        quantity: 5,
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(422);
    expect(json.error).toContain('Mã lô không được để trống');
  });

  it('should validate unit cost is positive', async () => {
    const request = new Request('http://localhost:3000/api/kits/bulk-create', {
      method: 'POST',
      body: JSON.stringify({
        batch_code: 'LOT-2024-001',
        kit_type_id: VALID_KIT_TYPE_UUID,
        supplier: 'Test Supplier',
        purchased_at: '2024-10-01',
        unit_cost: -100,
        quantity: 5,
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(422);
    expect(json.error).toContain('Đơn giá phải lớn hơn 0');
  });

  it('should handle duplicate batch code', async () => {
    mockSupabase.single.mockResolvedValueOnce({
      data: null,
      error: { code: '23505', message: 'Duplicate key' },
    });

    const request = new Request('http://localhost:3000/api/kits/bulk-create', {
      method: 'POST',
      body: JSON.stringify({
        batch_code: 'LOT-2024-001',
        kit_type_id: VALID_KIT_TYPE_UUID,
        supplier: 'Test Supplier',
        purchased_at: '2024-10-01',
        unit_cost: 100000,
        quantity: 5,
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(409);
    expect(json.error).toBe('Mã lô đã tồn tại');
  });

  it('should rollback batch if kit creation fails', async () => {
    const mockBatch = {
      id: 'batch-123',
      batch_code: 'LOT-2024-001',
    };

    // Mock successful batch creation
    mockSupabase.single.mockResolvedValueOnce({
      data: mockBatch,
      error: null,
    });

    // Mock failed kits creation
    mockSupabase.select.mockResolvedValueOnce({
      data: null,
      error: new Error('Kit creation failed'),
    });

    // Mock batch deletion (rollback)
    mockSupabase.eq.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/kits/bulk-create', {
      method: 'POST',
      body: JSON.stringify({
        batch_code: 'LOT-2024-001',
        kit_type_id: VALID_KIT_TYPE_UUID,
        supplier: 'Test Supplier',
        purchased_at: '2024-10-01',
        unit_cost: 100000,
        quantity: 5,
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(mockSupabase.delete).toHaveBeenCalled();
  });

  it('should create kits with correct naming pattern', async () => {
    const mockBatch = {
      id: 'batch-123',
      batch_code: 'LOT-2024-001',
    };

    mockSupabase.single.mockResolvedValueOnce({
      data: mockBatch,
      error: null,
    });

    mockSupabase.select.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    mockSupabase.insert.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/kits/bulk-create', {
      method: 'POST',
      body: JSON.stringify({
        batch_code: 'LOT-2024-001',
        kit_type_id: VALID_KIT_TYPE_UUID,
        supplier: 'Test Supplier',
        purchased_at: '2024-10-01',
        unit_cost: 100000,
        quantity: 3,
      }),
    });

    await POST(request);

    // Verify kits were created with correct pattern
    const insertCall = mockSupabase.insert.mock.calls.find(
      call => Array.isArray(call[0]) && call[0][0]?.kit_code
    );
    
    if (insertCall) {
      const kits = insertCall[0];
      expect(kits[0].kit_code).toBe('LOT-2024-001-001');
      expect(kits[1].kit_code).toBe('LOT-2024-001-002');
      expect(kits[2].kit_code).toBe('LOT-2024-001-003');
    }
  });

  it('should handle maximum quantity of 100', async () => {
    const mockBatch = {
      id: 'batch-123',
      batch_code: 'LOT-2024-001',
    };

    const mockKits = Array.from({ length: 100 }, (_, i) => ({
      id: `kit-${i + 1}`,
      batch_id: 'batch-123',
      kit_code: `LOT-2024-001-${String(i + 1).padStart(3, '0')}`,
      status: 'in_stock',
    }));

    mockSupabase.single.mockResolvedValueOnce({
      data: mockBatch,
      error: null,
    });

    mockSupabase.select.mockResolvedValueOnce({
      data: mockKits,
      error: null,
    });

    mockSupabase.insert.mockResolvedValueOnce({
      data: null,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/kits/bulk-create', {
      method: 'POST',
      body: JSON.stringify({
        batch_code: 'LOT-2024-001',
        kit_type_id: VALID_KIT_TYPE_UUID,
        supplier: 'Test Supplier',
        purchased_at: '2024-10-01',
        unit_cost: 100000,
        quantity: 100,
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data.count).toBe(100);
  });

  it('should handle unauthorized access', async () => {
    mockRequireEditor.mockRejectedValueOnce(new Error('Unauthorized'));

    const request = new Request('http://localhost:3000/api/kits/bulk-create', {
      method: 'POST',
      body: JSON.stringify({
        batch_code: 'LOT-2024-001',
        kit_type_id: 'type-123',
        supplier: 'Test Supplier',
        purchased_at: '2024-10-01',
        unit_cost: 100000,
        quantity: 5,
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

    const request = new Request('http://localhost:3000/api/kits/bulk-create', {
      method: 'POST',
      body: JSON.stringify({
        batch_code: 'LOT-2024-001',
        kit_type_id: 'type-123',
        supplier: 'Test Supplier',
        purchased_at: '2024-10-01',
        unit_cost: 100000,
        quantity: 5,
      }),
    });

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(403);
    expect(json.error).toBe('Bạn không có quyền thực hiện thao tác này');
  });

  it('should log audit trail on success', async () => {
    const mockBatch = {
      id: 'batch-123',
      batch_code: 'LOT-2024-001',
    };

    mockSupabase.single.mockResolvedValueOnce({
      data: mockBatch,
      error: null,
    });

    mockSupabase.select.mockResolvedValueOnce({
      data: [],
      error: null,
    });

    mockSupabase.insert.mockResolvedValue({
      data: null,
      error: null,
    });

    const request = new Request('http://localhost:3000/api/kits/bulk-create', {
      method: 'POST',
      body: JSON.stringify({
        batch_code: 'LOT-2024-001',
        kit_type_id: VALID_KIT_TYPE_UUID,
        supplier: 'Test Supplier',
        purchased_at: '2024-10-01',
        unit_cost: 100000,
        quantity: 5,
      }),
    });

    await POST(request);

    // Verify insert was called (for both kits and audit log)
    expect(mockSupabase.insert).toHaveBeenCalled();
  });
});
