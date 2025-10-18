import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { requireAuth } from '@/lib/auth/server';

// Severity mapping for metrics
const SEVERITY_MAP: Record<string, { level: number; label: string }> = {
  WSSV: { level: 3, label: 'nặng' },
  EHP: { level: 3, label: 'nặng' },
  EMS: { level: 3, label: 'nặng' },
  TPD: { level: 2, label: 'TB' },
  KHUAN: { level: 2, label: 'TB' },
  MBV: { level: 2, label: 'TB' },
  DIV1: { level: 2, label: 'TB' },
  DANG_KHAC: { level: 1, label: 'nhẹ' },
  VI_KHUAN_VI_NAM: { level: 1, label: 'nhẹ' },
  TAM_SOAT: { level: 1, label: 'nhẹ' },
  CL_GAN: { level: 1, label: 'nhẹ' },
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check authentication (both editor and viewer can view)
    await requireAuth();
    
    const supabase = await createClient();
    const { id } = await params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json(
        { error: 'ID mẫu không hợp lệ' },
        { status: 400 }
      );
    }

    // Fetch sample with results
    const { data: sample, error: sampleError } = await supabase
      .from('samples')
      .select(`
        id,
        sample_code,
        customer,
        results:sample_results(
          metric_code,
          metric_name,
          value_num,
          value_text,
          unit
        )
      `)
      .eq('id', id)
      .single();

    if (sampleError) {
      if (sampleError.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Không tìm thấy mẫu' },
          { status: 404 }
        );
      }
      console.error('[API] Error fetching sample:', sampleError);
      throw sampleError;
    }

    // Calculate KQ_CHUNG and build report message
    const results = sample.results || [];
    const positiveResults: Array<{
      metric_code: string;
      metric_name: string;
      value: number;
      severity: number;
      severityLabel: string;
    }> = [];

    let hasInfection = false;

    for (const result of results) {
      // Convert value_text "-" to 0, or use value_num
      let value = result.value_num ?? 0;
      if (result.value_text === '-') {
        value = 0;
      }

      // Check if positive (> 0)
      if (value > 0) {
        hasInfection = true;
        const severity = SEVERITY_MAP[result.metric_code] || { level: 1, label: 'nhẹ' };
        positiveResults.push({
          metric_code: result.metric_code,
          metric_name: result.metric_name,
          value,
          severity: severity.level,
          severityLabel: severity.label,
        });
      }
    }

    // Determine overall status
    const kq_chung = hasInfection ? 'NHIỄM' : 'SẠCH';

    // Build formatted message
    let message = `Mẫu ${sample.sample_code} - Khách hàng: ${sample.customer}\n`;
    message += `Kết quả tổng hợp: ${kq_chung}\n`;

    if (hasInfection && positiveResults.length > 0) {
      message += '\nCác chỉ số dương tính:\n';
      
      // Sort by severity (highest first)
      positiveResults.sort((a, b) => b.severity - a.severity);
      
      for (const result of positiveResults) {
        message += `- ${result.metric_name} (${result.metric_code}): ${result.value} (mức độ: ${result.severityLabel})\n`;
      }
    } else {
      message += '\nTất cả các chỉ số đều âm tính.';
    }

    return NextResponse.json({
      data: {
        sample_id: sample.id,
        sample_code: sample.sample_code,
        customer: sample.customer,
        kq_chung,
        positive_count: positiveResults.length,
        positive_results: positiveResults,
        message,
      }
    });

  } catch (error: any) {
    console.error('[API] Error in samples/:id/report-message GET:', error);

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
