'use client';

import { useCallback, useEffect, useState } from 'react';

import { UserProfile } from '@/lib/types';

const STORAGE_KEY = 'user_profile';

const DEFAULT_PROFILE: UserProfile = {
  id: '1',
  fullName: 'Team Member',
  email: 'team.member@company.com',
  jobTitle: 'Operations Associate',
  department: 'Operations',
  avatar: 'TM',
  managerName: '',
  managerEmail: '',
};

export function useUserProfile() {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setProfile({ ...DEFAULT_PROFILE, ...(JSON.parse(saved) as Partial<UserProfile>) });
      } catch (error) {
        setProfile(DEFAULT_PROFILE);
      }
    }
    setIsLoaded(true);
  }, []);

  const updateProfile = useCallback((updates: Partial<UserProfile>) => {
    setProfile((prev) => {
      const updated = { ...prev, ...updates };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const resetProfile = useCallback(() => {
    setProfile(DEFAULT_PROFILE);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return {
    profile,
    updateProfile,
    resetProfile,
    isLoaded,
  };
}
