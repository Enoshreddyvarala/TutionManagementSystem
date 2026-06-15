import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/sidebar';
import { Button } from '@/components/ui/button';
import { StudentsTable } from '@/components/modules/students-table';
import { Plus, Upload } from 'lucide-react';

interface SearchParams {
  page?: string;
  search?: string;
  status?: string;
}

export default async function StudentsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const page = Number(params.page) || 1;
  const pageSize = 20;
  const search = params.search ?? '';
  const status = params.status ?? '';

  const supabase = await createClient();
  let query = supabase
    .from('students')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * pageSize, page * pageSize - 1);

  if (search) query = query.or(`name.ilike.%${search}%,student_code.ilike.%${search}%,phone.ilike.%${search}%`);
  if (status) query = query.eq('status', status);

  const { data: students, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <>
      <Header title="Students" />
      <main className="p-6 space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-muted-foreground">{count ?? 0} students total</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/dashboard/students/import"><Upload className="h-4 w-4" /> Import</Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/students/new"><Plus className="h-4 w-4" /> Add Student</Link>
            </Button>
          </div>
        </div>

        <StudentsTable
          students={(students ?? []).map((s) => ({
            ...s,
            monthly_fee: Number(s.monthly_fee),
          }))}
          page={page}
          totalPages={totalPages}
          search={search}
          status={status}
        />
      </main>
    </>
  );
}
