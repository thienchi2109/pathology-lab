import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/server';

export async function GET(request: Request) {
  try {
    // Check authentication (both editor and viewer can access)
    await requireAuth();
    
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const kitTypeId = searchParams.get('kit_type_id');

    // Build query
    let query = supabase
      .from('kits')
      .select(`
        status,
        batch_id,
        kit_batches!inner(
          id,
          kit_type_id,
          batch_code,
          kit_types!inner(
            id,
            code,
            name
          )
        )
      `);

    // Filter by kit_type_id if provided
    if (kitTypeId) {
      query = query.eq('kit_batches.kit_type_id', kitTypeId);
    }

    const { data: kits, error } = await query;

    if (error) {
      console.error('[API] Error fetching kit availability:', error);
      throw error;
    }

    // Group kits by kit_type and status
    const availability: Record<string, {
      kit_type_id: string;
      kit_type_code: string;
      kit_type_name: string;
      by_status: Record<string, number>;
      total: number;
    }> = {};

    kits?.forEach((kit: any) => {
      const kitType = kit.kit_batches.kit_types;
      const kitTypeId = kitType.id;

      if (!availability[kitTypeId]) {
        availability[kitTypeId] = {
          kit_type_id: kitTypeId,
          kit_type_code: kitType.code,
          kit_type_name: kitType.name,
          by_status: {
            in_stock: 0,
            assigned: 0,
            used: 0,
            void: 0,
            expired: 0,
            lost: 0,
          },
          total: 0,
        };
      }

      availability[kitTypeId].by_status[kit.status] = 
        (availability[kitTypeId].by_status[kit.status] || 0) + 1;
      availability[kitTypeId].total += 1;
    });

    // Convert to array
    const result = Object.values(availability);

    return NextResponse.json({ data: result });

  } catch (error: any) {
    console.error('[API] Error in availability:', error);

    // Handle authentication errors
    if (error.message === 'Unauthorized' || error.message === 'Vui lòng đăng nhập') {
      return NextResponse.json(
        { error: 'Vui lòng đăng nhập' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Đã xảy ra lỗi, vui lòng thử lại' },
      { status: 500 }
    );
  }
}
