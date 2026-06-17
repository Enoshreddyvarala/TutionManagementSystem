import { redirect } from 'next/navigation';
import { getCurrentUser, getUserPermissions } from '@/lib/auth';
import { UserProvider } from '@/components/providers';
import { Sidebar, Header } from '@/components/layout/sidebar';

// Always read fresh role from database (avoid stale cached layout)
export const dynamic = 'force-dynamic';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/login');

  const permissions = await getUserPermissions(user.id);

  return (
    <UserProvider user={user} permissions={permissions}>
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:pl-64">
          {children}
        </div>
      </div>
    </UserProvider>
  );
}

export { Header };
