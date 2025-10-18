import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEditor, requireAuth } from '@/lib/auth/server';
import { z } from 'zod';

// Validation schema for sample creation
const createSampleSchema = z.object({
  kit_id: z.string().uuid('ID kit không hợp lệ').optional(),
  assignNext: z.boolean().optional(),
  kit_type_id: z.string().uuid('ID loại kit không hợp lệ').optional(),
  customer: z.string().min(1, 'Khách hàng không được để trống'),
  sample_type: z.string().min(1, 'Loại mẫu không được để trống'),
  received_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày nhận không hợp lệ'),
  collected_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày lấy mẫu không hợp lệ').optional().nullable(),
  technician: z.string().min(1, 'Kỹ thuật viên không được để trống'),
  price: z.number().nonnegative('Giá phải ≥ 0'),
  status: z.enum(['draft', 'done', 'approved']).optional(),
  billing_status: z.enum(['unpaid', 'invoiced', 'paid', 'eom_credit']).optional(),
  invoice_month: z.string().regex(/^\d{4}-\d{2}-01$/, 'Tháng hóa đơn không hợp lệ').optional().nullable(),
  category_id: z.string().uuid('ID danh mục không hợp lệ'),
  company_snapshot: z.object({
    name: z.string(),
    region: z.string().optional(),
    province: z.string().optional(),
  }),
  customer_snapshot: z.object({
    name: z.string(),
    phone: z.string().optional(),
    region: z.string().optional(),
  }),
  sl_mau: z.number().int().positive('Số lượng mẫu phải > 0'),
  note: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    // Check authentication and authorization
    const user = await requireEditor();
    
    const supabase = await createClient();
    const body = await request.json();

    // Validate request body
    const validationResult = createSampleSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 422 }
      );
    }

    const data = validationResult.data;

    // Validate that either kit_id or (assignNext + kit_type_id) is provided
    if (!data.kit_id && !data.assignNext) {
      return NextResponse.json(
        { error: 'Phải cung cấp kit_id hoặc assignNext=true' },
        { status: 400 }
      );
    }

    if (data.assignNext && !data.kit_type_id) {
      return NextResponse.json(
        { error: 'Phải cung cấp kit_type_id khi assignNext=true' },
        { status: 400 }
      );
    }

    let kitId = data.kit_id;

    // Auto-assign next available kit if requested
    if (data.assignNext && data.kit_type_id) {
      const { data: availableKit, error: kitError } = await supabase
        .from('kits')
        .select('id, kit_code, batch:kit_batches(kit_type_id)')
        .eq('status', 'in_stock')
        .eq('batch.kit_type_id', data.kit_type_id)
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (kitError || !availableKit) {
        // Get kit type name for error message
        const { data: kitType } = await supabase
          .from('kit_types')
          .select('name')
          .eq('id', data.kit_type_id)
          .single();

        return NextResponse.json(
          { error: `Không còn kit ${kitType?.name || 'loại này'}` },
          { status: 409 }
        );
      }

      kitId = availableKit.id;

      // Update kit status to 'assigned'
      await supabase
        .from('kits')
        .update({ 
          status: 'assigned',
          assigned_at: new Date().toISOString()
        })
        .eq('id', kitId);
    }

    // Generate sample code using database function
    const { data: sampleCode, error: codeError } = await supabase
      .rpc('next_sample_code', { received: data.received_at });

    if (codeError) {
      console.error('[API] Error generating sample code:', codeError);
      throw codeError;
    }

    // Create the sample
    const { data: sample, error: sampleError } = await supabase
      .from('samples')
      .insert({
        kit_id: kitId,
        sample_code: sampleCode,
        customer: data.customer,
        sample_type: data.sample_type,
        received_at: data.received_at,
        collected_at: data.collected_at || null,
        technician: data.technician,
        price: data.price,
        status: data.status || 'draft',
        billing_status: data.billing_status || 'unpaid',
        invoice_month: data.invoice_month || null,
        category_id: data.category_id,
        company_snapshot: data.company_snapshot,
        customer_snapshot: data.customer_snapshot,
        sl_mau: data.sl_mau,
        note: data.note || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (sampleError) {
      console.error('[API] Error creating sample:', sampleError);
      
      // Handle unique constraint violation
      if (sampleError.code === '23505') {
        return NextResponse.json(
          { error: 'Mã mẫu đã tồn tại' },
          { status: 409 }
        );
      }
      
      // Handle foreign key violation
      if (sampleError.code === '23503') {
        return NextResponse.json(
          { error: 'Kit không tồn tại hoặc đã được sử dụng' },
          { status: 409 }
        );
      }
      
      throw sampleError;
    }

    // Log audit trail
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'CREATE',
      entity: 'samples',
      entity_id: sample.id,
      diff: {
        after: {
          sample_code: sample.sample_code,
          kit_id: kitId,
          customer: data.customer,
        }
      }
    });

    return NextResponse.json({
      data: sample
    }, { status: 201 });

  } catch (error: any) {
    console.error('[API] Error in samples POST:', error);

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

export async function GET(request: Request) {
  try {
    // Check authentication (both editor and viewer can view)
    await requireAuth();
    
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    
    // Optional filters
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '50');
    const status = searchParams.get('status');
    const billingStatus = searchParams.get('billingStatus');
    const customer = searchParams.get('customer');

    let query = supabase
      .from('samples')
      .select('*, kit:kits(*)', { count: 'exact' });

    // Apply filters
    if (status) {
      query = query.eq('status', status);
    }
    if (billingStatus) {
      query = query.eq('billing_status', billingStatus);
    }
    if (customer) {
      query = query.ilike('customer', `%${customer}%`);
    }

    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // Order by received_at descending
    query = query.order('received_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      console.error('[API] Error fetching samples:', error);
      throw error;
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / pageSize),
      }
    });

  } catch (error: any) {
    console.error('[API] Error in samples GET:', error);

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
