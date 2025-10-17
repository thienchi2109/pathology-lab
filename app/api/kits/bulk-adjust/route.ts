import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEditor } from '@/lib/auth/server';
import { z } from 'zod';

// Validation schema for bulk adjust request
const bulkAdjustSchema = z.object({
  kit_type_id: z.string().uuid('ID loại kit không hợp lệ'),
  delta: z.number().int('Delta phải là số nguyên'),
  reason: z.string().optional().nullable(),
});

export async function POST(request: Request) {
  try {
    // Check authentication and authorization
    const user = await requireEditor();
    
    const supabase = await createClient();
    const body = await request.json();

    // Validate request body
    const validationResult = bulkAdjustSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 422 }
      );
    }

    const { kit_type_id, delta, reason } = validationResult.data;

    // Get batch IDs for this kit type
    const { data: batches, error: batchError } = await supabase
      .from('kit_batches')
      .select('id')
      .eq('kit_type_id', kit_type_id);

    if (batchError) {
      console.error('[API] Error fetching batches:', batchError);
      throw batchError;
    }

    const batchIds = batches?.map(b => b.id) || [];

    if (batchIds.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy kit loại này' },
        { status: 404 }
      );
    }

    // Get current in_stock count for the kit type
    const { count: inStockCount, error: countError } = await supabase
      .from('kits')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'in_stock')
      .in('batch_id', batchIds);

    if (countError) {
      console.error('[API] Error counting in_stock kits:', countError);
      throw countError;
    }

    const currentStock = inStockCount || 0;

    // Validate stock reduction
    if (delta < 0 && Math.abs(delta) > currentStock) {
      return NextResponse.json(
        { error: 'Chuyển quá số lượng tồn kho' },
        { status: 409 }
      );
    }

    // Handle positive delta (increase stock - mark kits as in_stock)
    if (delta > 0) {
      // Find kits that can be returned to stock (void, lost status)
      const { data: adjustableKits, error: fetchError } = await supabase
        .from('kits')
        .select('id, batch_id')
        .in('batch_id', batchIds)
        .in('status', ['void', 'lost'])
        .limit(delta);

      if (fetchError) {
        console.error('[API] Error fetching adjustable kits:', fetchError);
        throw fetchError;
      }

      if (!adjustableKits || adjustableKits.length < delta) {
        return NextResponse.json(
          { error: `Không đủ kit để điều chỉnh (cần ${delta}, có ${adjustableKits?.length || 0})` },
          { status: 409 }
        );
      }

      // Update kits to in_stock
      const kitIds = adjustableKits.map(k => k.id);
      const { error: updateError } = await supabase
        .from('kits')
        .update({ 
          status: 'in_stock',
          note: reason || null,
        })
        .in('id', kitIds);

      if (updateError) {
        console.error('[API] Error updating kits:', updateError);
        throw updateError;
      }

      // Log audit trail
      await supabase.from('audit_logs').insert({
        actor_id: user.id,
        action: 'UPDATE',
        entity: 'kits',
        entity_id: kit_type_id,
        diff: {
          action: 'bulk_adjust',
          delta: delta,
          kit_ids: kitIds,
          reason: reason,
        }
      });

      return NextResponse.json({
        data: {
          adjusted: kitIds.length,
          new_stock: currentStock + kitIds.length,
        }
      });
    }

    // Handle negative delta (decrease stock - mark kits as void)
    if (delta < 0) {
      const reduceCount = Math.abs(delta);

      // Find in_stock kits to void
      const { data: kitsToVoid, error: fetchError } = await supabase
        .from('kits')
        .select('id, batch_id')
        .in('batch_id', batchIds)
        .eq('status', 'in_stock')
        .limit(reduceCount);

      if (fetchError) {
        console.error('[API] Error fetching kits to void:', fetchError);
        throw fetchError;
      }

      if (!kitsToVoid || kitsToVoid.length < reduceCount) {
        return NextResponse.json(
          { error: 'Chuyển quá số lượng tồn kho' },
          { status: 409 }
        );
      }

      // Update kits to void
      const kitIds = kitsToVoid.map(k => k.id);
      const { error: updateError } = await supabase
        .from('kits')
        .update({ 
          status: 'void',
          note: reason || null,
        })
        .in('id', kitIds);

      if (updateError) {
        console.error('[API] Error voiding kits:', updateError);
        throw updateError;
      }

      // Log audit trail
      await supabase.from('audit_logs').insert({
        actor_id: user.id,
        action: 'UPDATE',
        entity: 'kits',
        entity_id: kit_type_id,
        diff: {
          action: 'bulk_adjust',
          delta: delta,
          kit_ids: kitIds,
          reason: reason,
        }
      });

      return NextResponse.json({
        data: {
          adjusted: kitIds.length,
          new_stock: currentStock - kitIds.length,
        }
      });
    }

    // Delta is 0, no adjustment needed
    return NextResponse.json({
      data: {
        adjusted: 0,
        new_stock: currentStock,
      }
    });

  } catch (error: any) {
    console.error('[API] Error in bulk-adjust:', error);

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
