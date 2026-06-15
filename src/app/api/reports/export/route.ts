import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { requirePermission } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requirePermission('report_view');
    const type = request.nextUrl.searchParams.get('type') ?? 'fee_collection';
    const format = request.nextUrl.searchParams.get('format') ?? 'xlsx';

    const baseUrl = request.nextUrl.origin;
    const reportRes = await fetch(`${baseUrl}/api/reports?type=${type}`, {
      headers: { cookie: request.headers.get('cookie') ?? '' },
    });
    const { data } = await reportRes.json();

    if (format === 'xlsx') {
      const ws = XLSX.utils.json_to_sheet(data ?? []);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Report');
      const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${type}-report.xlsx"`,
        },
      });
    }

    // PDF via simple text response (full PDF uses jspdf on client)
    const { generateCollectionReportPDF } = await import('@/lib/fees/receipt');
    const columns = data?.length > 0
      ? Object.keys(data[0]).map((k) => ({ header: k.replace(/_/g, ' '), dataKey: k }))
      : [];
    const doc = generateCollectionReportPDF(`${type} Report`, data ?? [], columns);
    const pdfBuffer = doc.output('arraybuffer');

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${type}-report.pdf"`,
      },
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 403 });
  }
}
