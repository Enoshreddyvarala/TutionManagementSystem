'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { ThemeProvider as NextThemesProvider, useTheme } from 'next-themes';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      {children}
    </NextThemesProvider>
  );
}

export { useTheme };

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="rounded-md p-2 hover:bg-accent"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}

interface UserContextValue {
  user: import('@/types').User | null;
  permissions: { code: import('@/types').PermissionCode; granted: boolean }[];
}

const UserContext = createContext<UserContextValue>({ user: null, permissions: [] });

export function UserProvider({
  children,
  user,
  permissions,
}: {
  children: React.ReactNode;
  user: import('@/types').User | null;
  permissions: { code: import('@/types').PermissionCode; granted: boolean }[];
}) {
  return <UserContext.Provider value={{ user, permissions }}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
