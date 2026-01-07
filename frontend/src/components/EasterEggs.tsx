'use client';

import { useEffect, useState } from 'react';
import { useAchievements } from '@/contexts/AchievementContext';

// Konami Code: ↑↑↓↓←→←→BA
const KONAMI_CODE = [
  'ArrowUp', 'ArrowUp',
  'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight',
  'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA'
];

export function KonamiCode() {
  const [inputSequence, setInputSequence] = useState<string[]>([]);
  const { unlockAchievement, isUnlocked } = useAchievements();

  useEffect(() => {
    if (isUnlocked('classically-trained')) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const newSequence = [...inputSequence, e.code].slice(-KONAMI_CODE.length);
      setInputSequence(newSequence);

      if (newSequence.join(',') === KONAMI_CODE.join(',')) {
        unlockAchievement('classically-trained');
        setInputSequence([]);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [inputSequence, unlockAchievement, isUnlocked]);

  return null;
}

// Console Easter Egg - runs once on mount
export function ConsoleEasterEgg() {
  useEffect(() => {
    const asciiArt = `
%c
    ╔══════════════════════════════════════════════════════════════╗
    ║                                                              ║
    ║   Hey there, curious developer!                              ║
    ║                                                              ║
    ║   Since you're poking around in the console,                 ║
    ║   you might enjoy some secrets hidden around the site...     ║
    ║                                                              ║
    ║   Built with Next.js, Laravel, and mass of mass            ║
    ║                                                              ║
    ╚══════════════════════════════════════════════════════════════╝

`;
    console.log(asciiArt, 'color: #da2862; font-family: monospace;');
    console.log('%cLooking for bugs? Or just curious? Either way, welcome!', 'color: #6b7280; font-style: italic;');
  }, []);

  return null;
}

// DevTools detection easter egg
export function DevToolsEasterEgg() {
  const [shown, setShown] = useState(false);
  const { unlockAchievement, isUnlocked } = useAchievements();

  useEffect(() => {
    if (shown || isUnlocked('inspector-gadget')) return;

    const threshold = 160;

    const checkDevTools = () => {
      const widthThreshold = window.outerWidth - window.innerWidth > threshold;
      const heightThreshold = window.outerHeight - window.innerHeight > threshold;

      if ((widthThreshold || heightThreshold) && !shown) {
        unlockAchievement('inspector-gadget');
        setShown(true);
      }
    };

    window.addEventListener('resize', checkDevTools);
    const interval = setInterval(checkDevTools, 1000);

    return () => {
      window.removeEventListener('resize', checkDevTools);
      clearInterval(interval);
    };
  }, [shown, unlockAchievement, isUnlocked]);

  return null;
}
