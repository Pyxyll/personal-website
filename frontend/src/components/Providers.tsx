'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/contexts/AuthContext';
import { AchievementProvider } from '@/contexts/AchievementContext';
import { KonamiCode, ConsoleEasterEgg, DevToolsEasterEgg } from '@/components/EasterEggs';
import { AchievementSystem } from '@/components/AchievementSystem';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AchievementProvider>
        <KonamiCode />
        <ConsoleEasterEgg />
        <DevToolsEasterEgg />
        {children}
        <AchievementSystem />
      </AchievementProvider>
    </AuthProvider>
  );
}
