'use client';

import { CheckSquare2, Clock3, LayoutDashboard } from 'lucide-react';

import { formatDateValue, getLocalDateValue } from '@/lib/date';
import { AppView, UserProfile } from '@/lib/types';
import { UserProfileCard } from '@/components/UserProfileCard';
import { Button } from '@/components/ui/button';

interface SidebarNavProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
  userProfile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
}

const navItems: Array<{ id: AppView; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tasks', icon: CheckSquare2 },
  { id: 'worklog', label: 'Work Log', icon: Clock3 },
];

export function SidebarNav({
  activeView,
  onViewChange,
  userProfile,
  onUpdateProfile,
}: SidebarNavProps) {
  return (
    <aside className="flex w-full flex-col border-b border-slate-200 bg-white p-5 lg:h-screen lg:w-80 lg:border-b-0 lg:border-r lg:p-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-sky-700">
          Task Tracker
        </p>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Workspace Console
        </h1>
        <p className="text-sm text-slate-600">
          Manage daily tasks, track progress, and maintain work logs in one workspace.
        </p>
      </div>

      <div className="mt-6">
        <UserProfileCard profile={userProfile} onUpdateProfile={onUpdateProfile} />
      </div>

      <nav className="mt-6 grid gap-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeView === item.id ? 'default' : 'ghost'}
              className="justify-start gap-2 rounded-2xl"
              onClick={() => onViewChange(item.id)}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </nav>

      <div className="mt-6 rounded-3xl border border-slate-200 bg-slate-50 p-4 lg:mt-auto">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
          Local Business Date
        </p>
        <p className="mt-2 text-sm font-medium text-slate-900">
          {formatDateValue(getLocalDateValue(), 'EEEE, MMMM dd, yyyy')}
        </p>
        <p className="mt-2 text-sm text-slate-600">
          Date-sensitive totals and filters use local date values instead of UTC ISO splits.
        </p>
      </div>
    </aside>
  );
}
