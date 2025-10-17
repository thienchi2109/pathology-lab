import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('kit_types')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[API] Error fetching kit types:', error);
    return NextResponse.json(
      { error: 'Không thể tải danh sách loại kit' },
      { status: 500 }
    );
  }
}
