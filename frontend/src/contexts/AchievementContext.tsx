'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  hint: string;
  unlockedAt?: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'trigger-happy',
    title: 'Trigger Happy',
    description: 'You clicked the logo 5 times. Your mouse called, it wants a break.',
    hint: 'Some things respond to repeated attention...',
  },
  {
    id: 'classically-trained',
    title: 'Classically Trained',
    description: '↑↑↓↓←→←→BA - A person of culture, I see.',
    hint: 'Old school gamers know this one by heart.',
  },
  {
    id: 'inspector-gadget',
    title: 'Inspector Gadget',
    description: 'I see you like to peek under the hood.',
    hint: 'Developers have special tools...',
  },
];

interface AchievementContextType {
  achievements: Achievement[];
  unlockedAchievements: Achievement[];
  hasAnyAchievement: boolean;
  unlockAchievement: (id: string) => void;
  isUnlocked: (id: string) => boolean;
  recentUnlock: Achievement | null;
  clearRecentUnlock: () => void;
  resetAchievements: () => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

const AchievementContext = createContext<AchievementContextType | undefined>(undefined);

const STORAGE_KEY = 'dylan-achievements';

export function AchievementProvider({ children }: { children: ReactNode }) {
  const [unlockedIds, setUnlockedIds] = useState<Record<string, number>>({});
  const [recentUnlock, setRecentUnlock] = useState<Achievement | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setUnlockedIds(JSON.parse(stored));
      } catch {
        // Invalid data, ignore
      }
    }
    setLoaded(true);
  }, []);

  // Save to localStorage when unlocked changes
  useEffect(() => {
    if (loaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unlockedIds));
    }
  }, [unlockedIds, loaded]);

  const unlockAchievement = useCallback((id: string) => {
    if (unlockedIds[id]) return; // Already unlocked

    const achievement = ACHIEVEMENTS.find((a) => a.id === id);
    if (!achievement) return;

    const now = Date.now();
    setUnlockedIds((prev) => ({ ...prev, [id]: now }));
    setRecentUnlock({ ...achievement, unlockedAt: now });
  }, [unlockedIds]);

  const isUnlocked = useCallback((id: string) => {
    return !!unlockedIds[id];
  }, [unlockedIds]);

  const clearRecentUnlock = useCallback(() => {
    setRecentUnlock(null);
  }, []);

  const resetAchievements = useCallback(() => {
    setUnlockedIds({});
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const unlockedAchievements = ACHIEVEMENTS.filter((a) => unlockedIds[a.id]).map((a) => ({
    ...a,
    unlockedAt: unlockedIds[a.id],
  }));

  const hasAnyAchievement = unlockedAchievements.length > 0;

  return (
    <AchievementContext.Provider
      value={{
        achievements: ACHIEVEMENTS,
        unlockedAchievements,
        hasAnyAchievement,
        unlockAchievement,
        isUnlocked,
        recentUnlock,
        clearRecentUnlock,
        resetAchievements,
        sidebarOpen,
        setSidebarOpen,
      }}
    >
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  const context = useContext(AchievementContext);
  if (context === undefined) {
    throw new Error('useAchievements must be used within an AchievementProvider');
  }
  return context;
}
