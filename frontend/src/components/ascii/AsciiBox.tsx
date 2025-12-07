'use client';

import { ReactNode } from 'react';

interface AsciiBoxProps {
  children: ReactNode;
  title?: string;
  className?: string;
}

export function AsciiBox({
  children,
  title,
  className = ""
}: AsciiBoxProps) {
  return (
    <div className={`
      bg-card
      border border-border p-4 relative
      transition-all duration-300
      hover:border-[var(--gradient-mid)]
      ${className}
    `}>
      {title && (
        <div className="absolute -top-3 left-4 bg-background px-2 text-foreground text-sm">
          [ {title} ]
        </div>
      )}
      {children}
    </div>
  );
}

export function AsciiDivider({
  className = "",
  char = '-',
  accent = false
}: {
  className?: string;
  char?: string;
  accent?: boolean;
}) {
  if (accent) {
    return (
      <div className={`divider-accent expand-line ${className}`} />
    );
  }

  return (
    <div className={`text-border overflow-hidden ${className}`}>
      {char.repeat(80)}
    </div>
  );
}

export function AsciiSection({
  children,
  title,
  className = ""
}: {
  children: ReactNode;
  title: string;
  className?: string;
}) {
  return (
    <section className={`mb-8 ${className}`}>
      <h2 className="text-foreground text-lg mb-4 flex items-center gap-3">
        <span className="text-[var(--gradient-mid)] font-bold">//</span>
        {title}
      </h2>
      <AsciiDivider className="mb-4" accent />
      {children}
    </section>
  );
}
