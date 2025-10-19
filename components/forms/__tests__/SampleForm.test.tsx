import { describe, it, expect } from 'vitest';
import { sampleFormSchema } from '@/lib/schemas';

describe('SampleForm Validation', () => {
  it('should validate required fields', () => {
    const invalidData = {
      assignNext: true,
      kit_type_id: '', // Missing required field
      customer: '', // Missing required field
      sample_type: '',
      received_at: '',
      technician: '',
      price: '',
      status: 'draft' as const,
      billing_status: 'unpaid' as const,
      category_id: '',
      company_name: '',
      customer_name: '',
      sl_mau: '',
    };

    const result = sampleFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.customer).toContain('Khách hàng không được để trống');
      expect(errors.sample_type).toContain('Loại mẫu không được để trống');
      expect(errors.received_at).toContain('Ngày nhận không được để trống');
      expect(errors.technician).toContain('Kỹ thuật viên không được để trống');
      expect(errors.price).toContain('Giá không được để trống');
      expect(errors.category_id).toContain('Vui lòng chọn danh mục');
      expect(errors.company_name).toContain('Tên công ty không được để trống');
      expect(errors.customer_name).toContain('Tên khách hàng không được để trống');
      expect(errors.sl_mau).toContain('Số lượng mẫu không được để trống');
    }
  });

  it('should validate price is non-negative number', () => {
    const invalidData = {
      assignNext: true,
      kit_type_id: 'kit-1',
      customer: 'Test Customer',
      sample_type: 'Test Type',
      received_at: '2024-01-01',
      technician: 'Test Tech',
      price: '-100', // Invalid negative price
      status: 'draft' as const,
      billing_status: 'unpaid' as const,
      category_id: 'cat-1',
      company_name: 'Test Company',
      customer_name: 'Test Customer Name',
      sl_mau: '1',
    };

    const result = sampleFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.price).toContain('Giá phải ≥ 0');
    }
  });

  it('should validate sample quantity is positive integer', () => {
    const invalidData = {
      assignNext: true,
      kit_type_id: 'kit-1',
      customer: 'Test Customer',
      sample_type: 'Test Type',
      received_at: '2024-01-01',
      technician: 'Test Tech',
      price: '100',
      status: 'draft' as const,
      billing_status: 'unpaid' as const,
      category_id: 'cat-1',
      company_name: 'Test Company',
      customer_name: 'Test Customer Name',
      sl_mau: '0', // Invalid zero quantity
    };

    const result = sampleFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.sl_mau).toContain('Số lượng mẫu phải > 0');
    }
  });

  it('should require invoice month for invoiced billing status', () => {
    const invalidData = {
      assignNext: true,
      kit_type_id: 'kit-1',
      customer: 'Test Customer',
      sample_type: 'Test Type',
      received_at: '2024-01-01',
      technician: 'Test Tech',
      price: '100',
      status: 'draft' as const,
      billing_status: 'invoiced' as const, // Requires invoice_month
      category_id: 'cat-1',
      company_name: 'Test Company',
      customer_name: 'Test Customer Name',
      sl_mau: '1',
      invoice_month: '', // Missing required field
    };

    const result = sampleFormSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
    
    if (!result.success) {
      const errors = result.error.flatten().fieldErrors;
      expect(errors.invoice_month).toContain('Vui lòng chọn tháng hóa đơn');
    }
  });

  it('should validate valid form data', () => {
    const validData = {
      assignNext: true,
      kit_type_id: 'kit-1',
      customer: 'Test Customer',
      sample_type: 'Test Type',
      received_at: '2024-01-01',
      collected_at: '2024-01-01',
      technician: 'Test Tech',
      price: '100.50',
      status: 'draft' as const,
      billing_status: 'unpaid' as const,
      category_id: 'cat-1',
      company_name: 'Test Company',
      company_region: 'Test Region',
      company_province: 'Test Province',
      customer_name: 'Test Customer Name',
      customer_phone: '0123456789',
      customer_region: 'Test Region',
      sl_mau: '5',
      note: 'Test note',
    };

    const result = sampleFormSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });
});