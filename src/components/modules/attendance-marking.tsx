'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Header } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toISODate } from '@/lib/utils';
import type { AttendanceStatus } from '@/types';

interface Student { id: string; name: string; student_code: string }
interface Batch { id: string; batch_name: string }

export function AttendanceMarking({ batches }: { batches: Batch[] }) {
  const router = useRouter();
  const [batchId, setBatchId] = useState('');
  const [date, setDate] = useState(toISODate(new Date()));
  const [students, setStudents] = useState<Student[]>([]);
  const [records, setRecords] = useState<Record<string, AttendanceStatus>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!batchId) { setStudents([]); return; }
    fetch(`/api/attendance/students?batch_id=${batchId}`)
      .then((r) => r.json())
      .then((data) => {
        setStudents(data);
        const initial: Record<string, AttendanceStatus> = {};
        data.forEach((s: Student) => { initial[s.id] = 'present'; });
        setRecords(initial);
      });
  }, [batchId]);

  async function handleSubmit() {
    if (!batchId || students.length === 0) return;
    setLoading(true);
    const res = await fetch('/api/attendance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        batch_id: batchId,
        date,
        records: students.map((s) => ({ student_id: s.id, status: records[s.id] ?? 'present' })),
      }),
    });
    setLoading(false);
    if (!res.ok) { toast.error('Failed to save attendance'); return; }
    toast.success('Attendance saved');
    router.refresh();
  }

  const STATUS_OPTIONS: { value: AttendanceStatus; label: string; variant: 'success' | 'destructive' | 'warning' }[] = [
    { value: 'present', label: 'Present', variant: 'success' },
    { value: 'absent', label: 'Absent', variant: 'destructive' },
    { value: 'leave', label: 'Leave', variant: 'warning' },
  ];

  return (
    <>
      <Header title="Attendance" />
      <main className="p-6 space-y-6">
        <Card>
          <CardHeader><CardTitle>Mark Attendance</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Batch</Label>
                <Select
                  value={batchId}
                  onChange={(e) => setBatchId(e.target.value)}
                  placeholder="Select batch"
                  options={batches.map((b) => ({ value: b.id, label: b.batch_name }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        {students.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{students.length} Students</CardTitle>
                <Button onClick={handleSubmit} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Attendance'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {students.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{s.name}</p>
                      <p className="text-sm text-muted-foreground">{s.student_code}</p>
                    </div>
                    <div className="flex gap-2">
                      {STATUS_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setRecords((prev) => ({ ...prev, [s.id]: opt.value }))}
                          className="focus:outline-none"
                        >
                          <Badge variant={records[s.id] === opt.value ? opt.variant : 'outline'}>
                            {opt.label}
                          </Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </>
  );
}
