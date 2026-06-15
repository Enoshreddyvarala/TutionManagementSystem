import type { PermissionCode, UserRole } from '@/types';

export const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Admin',
  accountant: 'Accountant',
  tutor: 'Tutor',
};

export const ROLE_PERMISSIONS: Record<UserRole, PermissionCode[]> = {
  super_admin: [
    'student_view', 'student_create', 'student_edit', 'student_delete',
    'attendance_view', 'attendance_mark',
    'fee_view', 'fee_create', 'fee_edit', 'fee_delete', 'fee_collect',
    'curriculum_view', 'curriculum_edit',
    'report_view',
    'batch_view', 'batch_create', 'batch_edit', 'batch_delete',
    'admin_create', 'admin_edit', 'admin_delete',
    'user_manage', 'audit_view', 'settings_manage',
  ],
  admin: [
    'student_view', 'student_create', 'student_edit', 'student_delete',
    'attendance_view', 'attendance_mark',
    'fee_view', 'fee_create', 'fee_edit',
    'curriculum_view', 'curriculum_edit',
    'report_view',
    'batch_view', 'batch_create', 'batch_edit',
  ],
  accountant: [
    'fee_view', 'fee_collect', 'report_view', 'student_view',
  ],
  tutor: [
    'student_view', 'attendance_view', 'attendance_mark',
    'curriculum_view', 'curriculum_edit',
  ],
};

export const PERMISSION_MODULES = {
  students: ['student_view', 'student_create', 'student_edit', 'student_delete'],
  attendance: ['attendance_view', 'attendance_mark'],
  fees: ['fee_view', 'fee_create', 'fee_edit', 'fee_delete', 'fee_collect'],
  curriculum: ['curriculum_view', 'curriculum_edit'],
  reports: ['report_view'],
  batches: ['batch_view', 'batch_create', 'batch_edit', 'batch_delete'],
  admin: ['admin_create', 'admin_edit', 'admin_delete', 'user_manage', 'audit_view', 'settings_manage'],
} as const;

export function hasPermission(
  role: UserRole,
  permission: PermissionCode,
  customPermissions?: { code: PermissionCode; granted: boolean }[]
): boolean {
  if (role === 'super_admin') return true;

  const custom = customPermissions?.find((p) => p.code === permission);
  if (custom !== undefined) return custom.granted;

  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function hasAnyPermission(
  role: UserRole,
  permissions: PermissionCode[],
  customPermissions?: { code: PermissionCode; granted: boolean }[]
): boolean {
  return permissions.some((p) => hasPermission(role, p, customPermissions));
}

export const ROUTE_PERMISSIONS: Record<string, PermissionCode[]> = {
  '/dashboard': [],
  '/dashboard/students': ['student_view'],
  '/dashboard/batches': ['batch_view'],
  '/dashboard/attendance': ['attendance_view'],
  '/dashboard/fees': ['fee_view'],
  '/dashboard/curriculum': ['curriculum_view'],
  '/dashboard/reports': ['report_view'],
  '/dashboard/users': ['user_manage'],
  '/dashboard/audit': ['audit_view'],
  '/dashboard/settings': ['settings_manage'],
};

export function canAccessRoute(
  role: UserRole,
  path: string,
  customPermissions?: { code: PermissionCode; granted: boolean }[]
): boolean {
  const matchedRoute = Object.keys(ROUTE_PERMISSIONS)
    .filter((route) => path.startsWith(route))
    .sort((a, b) => b.length - a.length)[0];

  if (!matchedRoute) return true;
  const required = ROUTE_PERMISSIONS[matchedRoute];
  if (required.length === 0) return true;
  return hasAnyPermission(role, required, customPermissions);
}

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard', permissions: [] as PermissionCode[] },
  { href: '/dashboard/students', label: 'Students', icon: 'Users', permissions: ['student_view'] as PermissionCode[] },
  { href: '/dashboard/batches', label: 'Batches', icon: 'BookOpen', permissions: ['batch_view'] as PermissionCode[] },
  { href: '/dashboard/attendance', label: 'Attendance', icon: 'CalendarCheck', permissions: ['attendance_view'] as PermissionCode[] },
  { href: '/dashboard/fees', label: 'Fees', icon: 'IndianRupee', permissions: ['fee_view'] as PermissionCode[] },
  { href: '/dashboard/curriculum', label: 'Curriculum', icon: 'GraduationCap', permissions: ['curriculum_view'] as PermissionCode[] },
  { href: '/dashboard/reports', label: 'Reports', icon: 'BarChart3', permissions: ['report_view'] as PermissionCode[] },
  { href: '/dashboard/users', label: 'Users', icon: 'UserCog', permissions: ['user_manage'] as PermissionCode[] },
  { href: '/dashboard/audit', label: 'Audit Logs', icon: 'ScrollText', permissions: ['audit_view'] as PermissionCode[] },
  { href: '/dashboard/settings', label: 'Settings', icon: 'Settings', permissions: ['settings_manage'] as PermissionCode[] },
];

export function getNavItemsForRole(
  role: UserRole,
  customPermissions?: { code: PermissionCode; granted: boolean }[]
) {
  return NAV_ITEMS.filter(
    (item) =>
      item.permissions.length === 0 ||
      hasAnyPermission(role, item.permissions, customPermissions)
  );
}
