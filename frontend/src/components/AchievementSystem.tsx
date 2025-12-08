'use client';

import { useEffect, useState } from 'react';
import { useAchievements, ACHIEVEMENTS } from '@/contexts/AchievementContext';

// Toast notification for recent unlocks
function AchievementToast() {
  const { recentUnlock, clearRecentUnlock } = useAchievements();

  useEffect(() => {
    if (recentUnlock) {
      const timer = setTimeout(clearRecentUnlock, 4000);
      return () => clearTimeout(timer);
    }
  }, [recentUnlock, clearRecentUnlock]);

  if (!recentUnlock) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-[var(--gradient-mid)] text-foreground text-sm px-4 py-3 z-50 fade-in shadow-lg max-w-sm">
      <div className="text-[var(--gradient-mid)] text-xs mb-1 uppercase tracking-wider">Achievement Unlocked</div>
      <div className="font-bold text-foreground">{recentUnlock.title}</div>
      <div className="text-muted-foreground text-xs mt-1">{recentUnlock.description}</div>
    </div>
  );
}

// Floating icon that appears after first achievement
function AchievementIcon() {
  const { hasAnyAchievement, unlockedAchievements, setSidebarOpen, sidebarOpen } = useAchievements();

  if (!hasAnyAchievement) return null;

  return (
    <button
      onClick={() => setSidebarOpen(!sidebarOpen)}
      className="fixed bottom-4 left-4 w-12 h-12 bg-card border border-border hover:border-[var(--gradient-mid)] transition-colors flex items-center justify-center z-40 group"
      aria-label="View achievements"
    >
      <span className="text-lg group-hover:text-[var(--gradient-mid)] transition-colors">★</span>
      <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--gradient-mid)] text-white text-xs flex items-center justify-center">
        {unlockedAchievements.length}
      </span>
    </button>
  );
}

// Sidebar showing all achievements
function AchievementSidebar() {
  const { achievements, isUnlocked, sidebarOpen, setSidebarOpen, unlockedAchievements, resetAchievements } = useAchievements();
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-background/80 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-card border-r border-border z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-foreground font-bold">Achievements</h2>
            <p className="text-xs text-muted-foreground">
              {unlockedAchievements.length} / {achievements.length} unlocked
            </p>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Close"
          >
            [x]
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-80px)]">
          {achievements.map((achievement) => {
            const unlocked = isUnlocked(achievement.id);
            return (
              <div
                key={achievement.id}
                className={`border p-3 transition-colors ${
                  unlocked
                    ? 'border-[var(--gradient-mid)] bg-[var(--gradient-mid)]/5'
                    : 'border-border opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`w-8 h-8 flex items-center justify-center text-lg ${
                      unlocked ? 'text-[var(--gradient-mid)]' : 'text-muted-foreground'
                    }`}
                  >
                    {unlocked ? '★' : '☆'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3
                      className={`font-bold text-sm ${
                        unlocked ? 'text-foreground' : 'text-muted-foreground'
                      }`}
                    >
                      {unlocked ? achievement.title : '???'}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {unlocked ? achievement.description : achievement.hint}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          <div className="border-t border-border pt-4 mt-4 space-y-4">
            {unlockedAchievements.length === achievements.length ? (
              <div className="text-center space-y-2">
                <p className="text-[var(--gradient-mid)] font-bold">
                  You found them all!
                </p>
                <p className="text-xs text-muted-foreground">
                  Back when the web was weird, websites were playgrounds. Welcome to mine.
                </p>
              </div>
            ) : (
              <p className="text-xs text-muted-foreground text-center">
                Keep exploring to find more secrets...
              </p>
            )}

            {unlockedAchievements.length > 0 && (
              <div className="relative">
                <button
                  onClick={() => setShowResetConfirm(!showResetConfirm)}
                  className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2 border border-border hover:border-foreground"
                >
                  Reset achievements
                </button>

                {showResetConfirm && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-background border border-border shadow-lg">
                    <p className="text-xs text-foreground mb-3">Start over?</p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          resetAchievements();
                          setSidebarOpen(false);
                          setShowResetConfirm(false);
                        }}
                        className="flex-1 text-xs py-1.5 bg-foreground text-background hover:bg-foreground/90 transition-colors"
                      >
                        Yes
                      </button>
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="flex-1 text-xs py-1.5 border border-border hover:border-foreground transition-colors"
                      >
                        No
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Main component that combines everything
export function AchievementSystem() {
  return (
    <>
      <AchievementToast />
      <AchievementIcon />
      <AchievementSidebar />
    </>
  );
}
