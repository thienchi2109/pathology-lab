import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEditor } from '@/lib/auth/server';
import { z } from 'zod';

// Validation schema for bulk create request
const bulkCreateSchema = z.object({
  batch_code: z.string().min(1, 'Mã lô không được để trống'),
  kit_type_id: z.string().uuid('ID loại kit không hợp lệ'),
  supplier: z.string().min(1, 'Nhà cung cấp không được để trống'),
  purchased_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày mua không hợp lệ'),
  unit_cost: z.number().positive('Đơn giá phải lớn hơn 0'),
  quantity: z.number().int().min(1, 'Số lượng phải ≥ 1').max(100, 'Số lượng quá lớn'),
  expires_at: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày hết hạn không hợp lệ').optional().nullable(),
  note: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    // Check authentication and authorization
    const user = await requireEditor();
    
    const supabase = await createClient();
    const body = await request.json();

    // Validate request body
    const validationResult = bulkCreateSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 422 }
      );
    }

    const data = validationResult.data;

    // Validate quantity limit
    if (data.quantity > 100) {
      return NextResponse.json(
        { error: 'Số lượng quá lớn' },
        { status: 422 }
      );
    }

    // Start transaction by creating kit batch first
    const { data: batch, error: batchError } = await supabase
      .from('kit_batches')
      .insert({
        batch_code: data.batch_code,
        kit_type_id: data.kit_type_id,
        supplier: data.supplier,
        purchased_at: data.purchased_at,
        unit_cost: data.unit_cost,
        quantity: data.quantity,
        expires_at: data.expires_at || null,
        note: data.note || null,
      })
      .select()
      .single();

    if (batchError) {
      console.error('[API] Error creating kit batch:', batchError);
      
      // Handle unique constraint violation
      if (batchError.code === '23505') {
        return NextResponse.json(
          { error: 'Mã lô đã tồn tại' },
          { status: 409 }
        );
      }
      
      throw batchError;
    }

    // Generate individual kits for the batch
    const kits = Array.from({ length: data.quantity }, (_, index) => ({
      batch_id: batch.id,
      kit_code: `${data.batch_code}-${String(index + 1).padStart(3, '0')}`,
      status: 'in_stock' as const,
    }));

    const { data: createdKits, error: kitsError } = await supabase
      .from('kits')
      .insert(kits)
      .select();

    if (kitsError) {
      console.error('[API] Error creating kits:', kitsError);
      
      // Rollback: delete the batch if kit creation fails
      await supabase.from('kit_batches').delete().eq('id', batch.id);
      
      throw kitsError;
    }

    // Log audit trail
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'CREATE',
      entity: 'kit_batches',
      entity_id: batch.id,
      diff: {
        after: {
          batch_code: data.batch_code,
          quantity: data.quantity,
          kit_type_id: data.kit_type_id,
        }
      }
    });

    return NextResponse.json({
      data: {
        batch,
        kits: createdKits,
        count: createdKits?.length || 0,
      }
    });

  } catch (error: any) {
    console.error('[API] Error in bulk-create:', error);

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
