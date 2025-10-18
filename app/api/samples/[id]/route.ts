import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth, requireEditor } from '@/lib/auth/server';
import { z } from 'zod';

// Validation schema for sample metadata update
const updateSampleSchema = z.object({
  customer: z.string().min(1, 'Khách hàng không được để trống').optional(),
  sample_type: z.string().min(1, 'Loại mẫu không được để trống').optional(),
  received_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày nhận không hợp lệ').optional(),
  collected_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày lấy mẫu không hợp lệ').optional().nullable(),
  technician: z.string().min(1, 'Kỹ thuật viên không được để trống').optional(),
  price: z.number().nonnegative('Giá phải ≥ 0').optional(),
  status: z.enum(['draft', 'done', 'approved']).optional(),
  billing_status: z.enum(['unpaid', 'invoiced', 'paid', 'eom_credit']).optional(),
  invoice_month: z.string().regex(/^\d{4}-\d{2}-01$/, 'Tháng hóa đơn không hợp lệ').optional().nullable(),
  category_id: z.string().uuid('ID danh mục không hợp lệ').optional(),
  company_snapshot: z.object({
    name: z.string(),
    region: z.string().optional(),
    province: z.string().optional(),
  }).optional(),
  customer_snapshot: z.object({
    name: z.string(),
    phone: z.string().optional(),
    region: z.string().optional(),
  }).optional(),
  sl_mau: z.number().int().positive('Số lượng mẫu phải > 0').optional(),
  note: z.string().optional().nullable(),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication (both editor and viewer can view)
    const user = await requireAuth();
    
    const supabase = await createClient();
    const { id } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'ID mẫu không hợp lệ' },
        { status: 400 }
      );
    }

    // Fetch sample with related data
    const { data: sample, error } = await supabase
      .from('samples')
      .select(`
        *,
        kit:kits(
          *,
          batch:kit_batches(
            *,
            kit_type:kit_types(*)
          )
        ),
        results:sample_results(*),
        images:sample_images(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Không tìm thấy mẫu' },
          { status: 404 }
        );
      }
      console.error('[API] Error fetching sample:', error);
      throw error;
    }

    // Log audit trail for VIEW action
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'VIEW',
      entity: 'samples',
      entity_id: id,
      diff: null
    });

    return NextResponse.json({
      data: sample
    });

  } catch (error: any) {
    console.error('[API] Error in samples/:id GET:', error);

    // Handle authentication errors
    if (error.message === 'Vui lòng đăng nhập') {
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Đã xảy ra lỗi, vui lòng thử lại' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication and authorization
    const user = await requireEditor();
    
    const supabase = await createClient();
    const { id } = await params;
    const body = await request.json();

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'ID mẫu không hợp lệ' },
        { status: 400 }
      );
    }

    // Validate request body
    const validationResult = updateSampleSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 422 }
      );
    }

    const data = validationResult.data;

    // Check if sample exists and get current state
    const { data: currentSample, error: fetchError } = await supabase
      .from('samples')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Không tìm thấy mẫu' },
          { status: 404 }
        );
      }
      throw fetchError;
    }

    // Update the sample
    const { data: updatedSample, error: updateError } = await supabase
      .from('samples')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('[API] Error updating sample:', updateError);
      throw updateError;
    }

    // Log audit trail with diff
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'UPDATE',
      entity: 'samples',
      entity_id: id,
      diff: {
        before: currentSample,
        after: updatedSample,
        changes: data
      }
    });

    return NextResponse.json({
      data: updatedSample
    });

  } catch (error: any) {
    console.error('[API] Error in samples/:id PATCH:', error);

    // Handle authentication/authorization errors
    if (error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập' },
        { status: 401 }
      );
    }

    if (error.message === 'Bạn không có quyền thực hiện thao tác này') {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: 'Đã xảy ra lỗi, vui lòng thử lại' },
      { status: 500 }
    );
  }
}
