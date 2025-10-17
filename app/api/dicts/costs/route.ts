import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('cost_catalog')
      .select(`
        *,
        kit_type:kit_types(id, code, name),
        sample_type:sample_types(id, code, name)
      `)
      .eq('is_active', true)
      .order('effective_from', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[API] Error fetching costs:', error);
    return NextResponse.json(
      { error: 'Không thể tải danh sách giá' },
      { status: 500 }
    );
  }
}
