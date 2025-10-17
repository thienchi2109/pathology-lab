import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from('sample_types')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[API] Error fetching sample types:', error);
    return NextResponse.json(
      { error: 'Không thể tải danh sách loại mẫu' },
      { status: 500 }
    );
  }
}
