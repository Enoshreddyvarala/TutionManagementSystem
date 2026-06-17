'use client';

import { Badge } from '@/components/ui/badge';
import { DataTable } from '@/components/ui/data-table';

export interface CurriculumRow {
  id: string;
  batch_name: string;
  subject: string;
  topic: string;
  status: string;
  completion_percentage: number;
}

const STATUS_VARIANT: Record<string, 'secondary' | 'warning' | 'success'> = {
  pending: 'secondary',
  in_progress: 'warning',
  completed: 'success',
};

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export function CurriculumTable({ items }: { items: CurriculumRow[] }) {
  return (
    <DataTable
      data={items}
      emptyMessage="No curriculum topics yet. Add a topic to get started."
      columns={[
        { key: 'batch_name', header: 'Batch' },
        { key: 'subject', header: 'Subject' },
        { key: 'topic', header: 'Topic' },
        {
          key: 'completion_percentage',
          header: 'Progress',
          render: (r) => `${r.completion_percentage}%`,
        },
        {
          key: 'status',
          header: 'Status',
          render: (r) => (
            <Badge variant={STATUS_VARIANT[r.status] ?? 'secondary'}>
              {STATUS_LABEL[r.status] ?? r.status}
            </Badge>
          ),
        },
      ]}
    />
  );
}
