import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/server';
import { z } from 'zod';

// Validation schema for next-code request
const nextCodeSchema = z.object({
  receivedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ngày nhận không hợp lệ'),
});

export async function GET(request: Request) {
  try {
    // Check authentication (both editor and viewer can view)
    await requireAuth();
    
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const receivedAt = searchParams.get('receivedAt');

    // Validate query parameter
    if (!receivedAt) {
      return NextResponse.json(
        { error: 'Tham số receivedAt là bắt buộc' },
        { status: 400 }
      );
    }

    const validationResult = nextCodeSchema.safeParse({ receivedAt });
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 400 }
      );
    }

    // Call the database function to get next sample code
    const { data, error } = await supabase
      .rpc('next_sample_code', { received: receivedAt });

    if (error) {
      console.error('[API] Error calling next_sample_code:', error);
      throw error;
    }

    return NextResponse.json({
      data: {
        sample_code: data,
        received_at: receivedAt,
      }
    });

  } catch (error: any) {
    console.error('[API] Error in next-code:', error);

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
