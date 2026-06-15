'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, Users, BookOpen, CalendarCheck, IndianRupee,
  GraduationCap, BarChart3, UserCog, ScrollText, Settings, LogOut, Menu, X,
} from 'lucide-react';
import { useState } from 'react';
import { cn, getInitials } from '@/lib/utils';
import { getNavItemsForRole } from '@/lib/permissions';
import { useUser } from '@/components/providers';
import { ThemeToggle } from '@/components/providers';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { ROLE_LABELS } from '@/lib/permissions';

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard, Users, BookOpen, CalendarCheck, IndianRupee,
  GraduationCap, BarChart3, UserCog, ScrollText, Settings,
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, permissions } = useUser();
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();

  if (!user) return null;

  const navItems = getNavItemsForRole(user.role, permissions);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  }

  const sidebarContent = (
    <>
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-lg">
          <GraduationCap className="h-6 w-6 text-primary" />
          <span>TMS</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const Icon = ICONS[item.icon] ?? LayoutDashboard;
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t p-4">
        <div className="flex items-center gap-3 rounded-lg px-3 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
            {getInitials(user.name)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground">{ROLE_LABELS[user.role]}</p>
          </div>
        </div>
        <Button variant="ghost" className="mt-2 w-full justify-start gap-2" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </Button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={cn(
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-transform lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        {sidebarContent}
      </aside>
    </>
  );
}

export function Header({ title }: { title?: string }) {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6 lg:pl-72">
      <h1 className="text-xl font-semibold lg:ml-0 ml-12">{title ?? 'Dashboard'}</h1>
      <ThemeToggle />
    </header>
  );
}
