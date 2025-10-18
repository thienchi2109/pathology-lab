import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireEditor } from '@/lib/auth/server';
import { z } from 'zod';

// Validation schema for sample results
const sampleResultSchema = z.object({
  metric_code: z.enum([
    'CL_GAN',
    'WSSV',
    'EHP',
    'EMS',
    'TPD',
    'KHUAN',
    'MBV',
    'DIV1',
    'DANG_KHAC',
    'VI_KHUAN_VI_NAM',
    'TAM_SOAT'
  ], {
    message: 'Mã chỉ số không hợp lệ'
  }),
  metric_name: z.string().min(1, 'Tên chỉ số không được để trống'),
  value_num: z.number().optional().nullable(),
  value_text: z.string().optional().nullable(),
  unit: z.string().default(''),
  ref_low: z.number().optional().nullable(),
  ref_high: z.number().optional().nullable(),
});

const updateResultsSchema = z.object({
  results: z.array(sampleResultSchema).min(1, 'Phải có ít nhất một kết quả'),
});

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
    const validationResult = updateResultsSchema.safeParse(body);
    if (!validationResult.success) {
      const firstError = validationResult.error.issues[0];
      return NextResponse.json(
        { error: firstError.message },
        { status: 422 }
      );
    }

    const { results } = validationResult.data;

    // Check if sample exists
    const { data: sample, error: sampleError } = await supabase
      .from('samples')
      .select('id')
      .eq('id', id)
      .single();

    if (sampleError) {
      if (sampleError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Không tìm thấy mẫu' },
          { status: 404 }
        );
      }
      throw sampleError;
    }

    // Get existing results for diff
    const { data: existingResults } = await supabase
      .from('sample_results')
      .select('*')
      .eq('sample_id', id);

    // Delete existing results for this sample
    const { error: deleteError } = await supabase
      .from('sample_results')
      .delete()
      .eq('sample_id', id);

    if (deleteError) {
      console.error('[API] Error deleting existing results:', deleteError);
      throw deleteError;
    }

    // Process results: convert "-" to 0 for value_num
    const processedResults = results.map(result => ({
      sample_id: id,
      metric_code: result.metric_code,
      metric_name: result.metric_name,
      value_num: result.value_text === '-' ? 0 : result.value_num,
      value_text: result.value_text,
      unit: result.unit || '',
      ref_low: result.ref_low,
      ref_high: result.ref_high,
    }));

    // Insert new results
    const { data: newResults, error: insertError } = await supabase
      .from('sample_results')
      .insert(processedResults)
      .select();

    if (insertError) {
      console.error('[API] Error inserting results:', insertError);
      throw insertError;
    }

    // Log audit trail
    await supabase.from('audit_logs').insert({
      actor_id: user.id,
      action: 'UPDATE',
      entity: 'sample_results',
      entity_id: id,
      diff: {
        before: existingResults || [],
        after: newResults,
        sample_id: id
      }
    });

    return NextResponse.json({
      data: newResults,
      count: newResults?.length || 0
    });

  } catch (error: any) {
    console.error('[API] Error in samples/:id/results PATCH:', error);

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
