'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileSpreadsheet } from 'lucide-react';
import { toast } from 'sonner';

const REPORT_TYPES = [
  { value: 'fee_collection', label: 'Fee Collection Report' },
  { value: 'outstanding', label: 'Outstanding Fees Report' },
  { value: 'advance', label: 'Advance Payment Report' },
  { value: 'defaulters', label: 'Defaulter Report' },
  { value: 'attendance_monthly', label: 'Monthly Attendance' },
  { value: 'attendance_batch', label: 'Batch Attendance' },
  { value: 'active_students', label: 'Active Students' },
  { value: 'batch_report', label: 'Batch Report' },
];

export default function ReportsPage() {
  const [reportType, setReportType] = useState('fee_collection');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Record<string, unknown>[]>([]);

  async function generateReport() {
    setLoading(true);
    const res = await fetch(`/api/reports?type=${reportType}`);
    const result = await res.json();
    setLoading(false);
    if (!res.ok) { toast.error('Failed to generate report'); return; }
    setData(result.data ?? []);
    toast.success(`Report generated: ${result.data?.length ?? 0} records`);
  }

  async function exportExcel() {
    const res = await fetch(`/api/reports/export?type=${reportType}&format=xlsx`);
    if (!res.ok) { toast.error('Export failed'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report.xlsx`;
    a.click();
  }

  async function exportPDF() {
    const res = await fetch(`/api/reports/export?type=${reportType}&format=pdf`);
    if (!res.ok) { toast.error('Export failed'); return; }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType}-report.pdf`;
    a.click();
  }

  const columns = data.length > 0 ? Object.keys(data[0]) : [];

  return (
    <>
      <Header title="Reports" />
      <main className="p-6 space-y-6">
        <Card>
          <CardHeader><CardTitle>Generate Report</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="flex-1">
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                options={REPORT_TYPES}
              />
            </div>
            <Button onClick={generateReport} disabled={loading}>
              {loading ? 'Generating...' : 'Generate'}
            </Button>
            {data.length > 0 && (
              <>
                <Button variant="outline" onClick={exportExcel}><FileSpreadsheet className="h-4 w-4" /> Excel</Button>
                <Button variant="outline" onClick={exportPDF}><Download className="h-4 w-4" /> PDF</Button>
              </>
            )}
          </CardContent>
        </Card>

        {data.length > 0 && (
          <Card>
            <CardHeader><CardTitle>Results ({data.length})</CardTitle></CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    {columns.map((col) => <th key={col} className="px-3 py-2 text-left capitalize">{col.replace(/_/g, ' ')}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {data.slice(0, 100).map((row, i) => (
                    <tr key={i} className="border-b">
                      {columns.map((col) => <td key={col} className="px-3 py-2">{String(row[col] ?? '')}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
