'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { Student } from '@/types';
import { DataTable } from '@/components/ui/data-table';
import { Pagination } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { formatCurrency, formatDate } from '@/lib/utils';
import { useState } from 'react';
import { Search } from 'lucide-react';

interface StudentsTableProps {
  students: Student[];
  page: number;
  totalPages: number;
  search: string;
  status: string;
}

const STATUS_VARIANT: Record<string, 'success' | 'warning' | 'secondary'> = {
  active: 'success',
  inactive: 'warning',
  archived: 'secondary',
};

export function StudentsTable({ students, page, totalPages, search, status }: StudentsTableProps) {
  const router = useRouter();
  const [searchVal, setSearchVal] = useState(search);

  function updateParams(key: string, value: string) {
    const params = new URLSearchParams();
    if (key === 'search' ? value : search) params.set('search', key === 'search' ? value : search);
    if (key === 'status' ? value : status) params.set('status', key === 'status' ? value : status);
    params.set('page', '1');
    router.push(`/dashboard/students?${params.toString()}`);
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search by name, code, or phone..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && updateParams('search', searchVal)}
          />
        </div>
        <Select
          className="w-full sm:w-40"
          value={status}
          onChange={(e) => updateParams('status', e.target.value)}
          placeholder="All Status"
          options={[
            { value: 'active', label: 'Active' },
            { value: 'inactive', label: 'Inactive' },
            { value: 'archived', label: 'Archived' },
          ]}
        />
      </div>

      <DataTable
        data={students}
        onRowClick={(row) => router.push(`/dashboard/students/${row.id}`)}
        columns={[
          { key: 'student_code', header: 'ID' },
          { key: 'name', header: 'Name' },
          { key: 'phone', header: 'Phone' },
          { key: 'parent_contact', header: 'Parent Contact' },
          { key: 'monthly_fee', header: 'Monthly Fee', render: (r) => formatCurrency(r.monthly_fee as number) },
          { key: 'joining_date', header: 'Joined', render: (r) => formatDate(r.joining_date as string) },
          {
            key: 'status',
            header: 'Status',
            render: (r) => (
              <Badge variant={STATUS_VARIANT[r.status as string] ?? 'secondary'}>
                {String(r.status)}
              </Badge>
            ),
          },
        ]}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        onPageChange={(p) => {
          const params = new URLSearchParams();
          if (search) params.set('search', search);
          if (status) params.set('status', status);
          params.set('page', String(p));
          router.push(`/dashboard/students?${params.toString()}`);
        }}
      />
    </div>
  );
}
