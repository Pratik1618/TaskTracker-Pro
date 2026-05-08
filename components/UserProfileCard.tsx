'use client';

import { useEffect, useState } from 'react';
import { Edit2 } from 'lucide-react';

import { UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface UserProfileCardProps {
  profile: UserProfile;
  onUpdateProfile: (updates: Partial<UserProfile>) => void;
  onLogout?: () => void;
}

export function UserProfileCard({ profile, onUpdateProfile, onLogout }: UserProfileCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState(profile);

  useEffect(() => {
    setEditData(profile);
  }, [profile]);

  const handleSave = () => {
    onUpdateProfile(editData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditData(profile);
    setIsEditing(false);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-4 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-100 text-sm font-semibold tracking-[0.18em] text-sky-700">
              {profile.avatar}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-50">{profile.fullName}</p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{profile.jobTitle}</p>
            </div>
          </div>
        </button>
      </PopoverTrigger>

      <PopoverContent className="w-80 border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50">
        {!isEditing ? (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="font-semibold text-slate-900 dark:text-slate-50">{profile.fullName}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400">{profile.jobTitle}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-slate-500 dark:text-slate-400">
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Email</p>
                <p className="text-slate-900 dark:text-slate-50">{profile.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Manager</p>
                <p className="text-slate-900 dark:text-slate-50">{profile.managerName || 'Not set'}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{profile.managerEmail || 'No manager email'}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Department</p>
                <p className="text-slate-900 dark:text-slate-50">{profile.department}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Profile Code</p>
                <p className="text-slate-900 dark:text-slate-50">{profile.avatar}</p>
              </div>
            </div>
            {onLogout && (
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-4">
                <Button variant="outline" className="w-full text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950/30 border-slate-200 dark:border-slate-800" onClick={onLogout}>
                  Log Out
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Full Name
              </label>
              <Input
                value={editData.fullName}
                onChange={(event) => setEditData({ ...editData, fullName: event.target.value })}
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Email
              </label>
              <Input
                type="email"
                value={editData.email}
                onChange={(event) => setEditData({ ...editData, email: event.target.value })}
                placeholder="Enter email"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Job Title
              </label>
              <Input
                value={editData.jobTitle}
                onChange={(event) => setEditData({ ...editData, jobTitle: event.target.value })}
                placeholder="Enter job title"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Manager Name
              </label>
              <Input
                value={editData.managerName}
                onChange={(event) => setEditData({ ...editData, managerName: event.target.value })}
                placeholder="Enter manager name"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Manager Email
              </label>
              <Input
                type="email"
                value={editData.managerEmail}
                onChange={(event) => setEditData({ ...editData, managerEmail: event.target.value })}
                placeholder="Enter manager email"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Department
              </label>
              <Input
                value={editData.department}
                onChange={(event) => setEditData({ ...editData, department: event.target.value })}
                placeholder="Enter department"
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Profile Code
              </label>
              <Input
                value={editData.avatar}
                onChange={(event) => setEditData({ ...editData, avatar: event.target.value.slice(0, 3).toUpperCase() })}
                placeholder="e.g. TM"
                maxLength={3}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1" onClick={handleSave}>
                Save
              </Button>
              <Button className="flex-1" variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
