'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Header } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function ImportStudentsPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<Record<string, string>[]>([]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target?.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json<Record<string, string>>(ws);
      setPreview(data.slice(0, 5));
    };
    reader.readAsBinaryString(file);
  }

  async function handleImport() {
    const file = fileRef.current?.files?.[0];
    if (!file) { toast.error('Select a file'); return; }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      const wb = XLSX.read(evt.target?.result, { type: 'binary' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws);

      let success = 0;
      for (const row of rows) {
        const res = await fetch('/api/students', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: row.name || row.Name,
            phone: row.phone || row.Phone || '',
            parent_contact: row.parent_contact || row['Parent Contact'] || '',
            joining_date: row.joining_date || row['Joining Date'] || new Date().toISOString().split('T')[0],
            monthly_fee: Number(row.monthly_fee || row['Monthly Fee'] || 0),
            status: 'active',
          }),
        });
        if (res.ok) success++;
      }

      setLoading(false);
      toast.success(`Imported ${success} of ${rows.length} students`);
      router.push('/dashboard/students');
    };
    reader.readAsBinaryString(file);
  }

  return (
    <>
      <Header title="Import Students" />
      <main className="p-6 max-w-2xl">
        <Card>
          <CardHeader><CardTitle>Bulk Import from Excel</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload an Excel file with columns: name, phone, parent_contact, joining_date, monthly_fee
            </p>
            <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} className="block w-full text-sm" />
            {preview.length > 0 && (
              <div className="rounded-lg border p-4">
                <p className="text-sm font-medium mb-2">Preview (first 5 rows)</p>
                <pre className="text-xs overflow-auto">{JSON.stringify(preview, null, 2)}</pre>
              </div>
            )}
            <Button onClick={handleImport} disabled={loading || preview.length === 0}>
              <Upload className="h-4 w-4" />
              {loading ? 'Importing...' : 'Import Students'}
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
