import { createClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/sidebar';
import { StatCard } from '@/components/ui/pagination';
import { formatCurrency } from '@/lib/utils';
import {
  Users, UserCheck, IndianRupee, AlertCircle, TrendingUp, CalendarCheck,
} from 'lucide-react';
import { DashboardCharts } from '@/components/modules/dashboard-charts';

async function getDashboardStats() {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];
  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0];

  const [
    { count: totalStudents },
    { count: activeStudents },
    { count: totalTutors },
    { count: totalAdmins },
    { count: todayAttendance },
    { data: monthlyTxns },
    { data: pendingLedger },
    { data: advanceBalances },
  ] = await Promise.all([
    supabase.from('students').select('*', { count: 'exact', head: true }),
    supabase.from('students').select('*', { count: 'exact', head: true }).eq('status', 'active'),
    supabase.from('users').select('*', { count: 'exact', head: true }).eq('role', 'tutor').eq('status', 'active'),
    supabase.from('users').select('*', { count: 'exact', head: true }).in('role', ['admin', 'super_admin']).eq('status', 'active'),
    supabase.from('attendance').select('*', { count: 'exact', head: true }).eq('date', today).eq('status', 'present'),
    supabase.from('fee_transactions').select('amount').gte('payment_date', monthStart),
    supabase.from('fee_ledger').select('balance, student_id').in('status', ['pending', 'partial']),
    supabase.from('student_advance_balance').select('balance, student_id').gt('balance', 0),
  ]);

  const monthlyCollection = monthlyTxns?.reduce((sum, t) => sum + Number(t.amount), 0) ?? 0;
  const pendingFees = pendingLedger?.reduce((sum, l) => sum + Number(l.balance), 0) ?? 0;
  const advanceCollections = advanceBalances?.reduce((sum, a) => sum + Number(a.balance), 0) ?? 0;
  const studentsWithDues = new Set(pendingLedger?.map((l) => l.student_id)).size;
  const studentsInAdvance = advanceBalances?.length ?? 0;

  return {
    total_students: totalStudents ?? 0,
    active_students: activeStudents ?? 0,
    total_tutors: totalTutors ?? 0,
    total_admins: totalAdmins ?? 0,
    today_attendance: todayAttendance ?? 0,
    monthly_collection: monthlyCollection,
    pending_fees: pendingFees,
    advance_collections: advanceCollections,
    students_with_dues: studentsWithDues,
    students_in_advance: studentsInAdvance,
  };
}

async function getChartData() {
  const supabase = await createClient();
  const months: { month: string; collection: number; attendance: number; students: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthStart = new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split('T')[0];
    const monthEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split('T')[0];
    const monthLabel = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });

    const [{ data: txns }, { count: attCount }, { count: studentCount }] = await Promise.all([
      supabase.from('fee_transactions').select('amount').gte('payment_date', monthStart).lte('payment_date', monthEnd),
      supabase.from('attendance').select('*', { count: 'exact', head: true }).gte('date', monthStart).lte('date', monthEnd).eq('status', 'present'),
      supabase.from('students').select('*', { count: 'exact', head: true }).lte('created_at', monthEnd + 'T23:59:59'),
    ]);

    months.push({
      month: monthLabel,
      collection: txns?.reduce((s, t) => s + Number(t.amount), 0) ?? 0,
      attendance: attCount ?? 0,
      students: studentCount ?? 0,
    });
  }

  return months;
}

export default async function DashboardPage() {
  const [stats, chartData] = await Promise.all([getDashboardStats(), getChartData()]);

  return (
    <>
      <Header title="Dashboard" />
      <main className="p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Students" value={stats.total_students} icon={<Users className="h-4 w-4" />} description={`${stats.active_students} active`} />
          <StatCard title="Today's Attendance" value={stats.today_attendance} icon={<CalendarCheck className="h-4 w-4" />} />
          <StatCard title="Monthly Collection" value={formatCurrency(stats.monthly_collection)} icon={<IndianRupee className="h-4 w-4" />} />
          <StatCard title="Pending Fees" value={formatCurrency(stats.pending_fees)} icon={<AlertCircle className="h-4 w-4" />} description={`${stats.students_with_dues} students with dues`} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Tutors" value={stats.total_tutors} icon={<UserCheck className="h-4 w-4" />} />
          <StatCard title="Total Admins" value={stats.total_admins} icon={<Users className="h-4 w-4" />} />
          <StatCard title="Advance Collections" value={formatCurrency(stats.advance_collections)} icon={<TrendingUp className="h-4 w-4" />} description={`${stats.students_in_advance} students in advance`} />
          <StatCard title="Active Students" value={stats.active_students} icon={<Users className="h-4 w-4" />} />
        </div>

        <DashboardCharts data={chartData} />
      </main>
    </>
  );
}
