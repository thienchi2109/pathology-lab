import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const supabase = await createClient();

    let query = supabase
      .from('companies')
      .select('*')
      .eq('is_active', true)
      .order('name');

    // Add search filter if provided
    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ data });
  } catch (error) {
    console.error('[API] Error fetching companies:', error);
    return NextResponse.json(
      { error: 'Không thể tải danh sách công ty' },
      { status: 500 }
    );
  }
}
