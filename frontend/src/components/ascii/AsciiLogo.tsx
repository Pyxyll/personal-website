'use client';

import { useState, useEffect } from 'react';
import { useAchievements } from '@/contexts/AchievementContext';

interface AsciiLogoProps {
  className?: string;
}

export function AsciiLogo({ className = "" }: AsciiLogoProps) {
  const [clickCount, setClickCount] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const { unlockAchievement, isUnlocked } = useAchievements();

  useEffect(() => {
    if (clickCount === 5 && !isUnlocked('trigger-happy')) {
      unlockAchievement('trigger-happy');
      setIsShaking(true);

      const timer = setTimeout(() => {
        setIsShaking(false);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [clickCount, unlockAchievement, isUnlocked]);

  const handleClick = () => {
    setClickCount((prev) => prev + 1);
  };

  return (
    <div className={`group relative ${className}`}>
      {/* Main ASCII art */}
      <pre
        onClick={handleClick}
        className={`ascii-art select-none transition-colors duration-300 group-hover:text-[var(--gradient-mid)] cursor-pointer ${isShaking ? 'shake' : ''}`}
      >
{`+---------------------------------------------------------------+
|                                                               |
|   ____        _               ____      _ _ _                 |
|  |  _ \\ _   _| | __ _ _ __   / ___|___ | | (_)_ __  ___       |
|  | | | | | | | |/ _\` | '_ \\ | |   / _ \\| | | | '_ \\/ __|      |
|  | |_| | |_| | | (_| | | | || |__| (_) | | | | | | \\__ \\      |
|  |____/ \\__, |_|\\__,_|_| |_| \\____\\___/|_|_|_|_| |_|___/      |
|         |___/                                                 |
|                                                               |
+---------------------------------------------------------------+`}
      </pre>
      {/* Tagline */}
      <div className="text-center mt-2 text-sm tracking-widest">
        <span className="text-muted-foreground">Developer</span>
        <span className="mx-2 text-[var(--gradient-mid)]">/</span>
        <span className="text-muted-foreground">Creator</span>
        <span className="mx-2 text-[var(--gradient-mid)]">/</span>
        <span className="text-muted-foreground">Builder</span>
      </div>
    </div>
  );
}

export function AsciiLogoSmall({ className = "" }: { className?: string }) {
  return (
    <span className={`font-mono text-foreground transition-colors duration-300 ${className}`}>
      dylan collins
    </span>
  );
}
