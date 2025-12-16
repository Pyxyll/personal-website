'use client';

import { ReactNode } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';

interface AsciiCardProps {
  title: string;
  description?: string;
  href?: string;
  tags?: string[];
  date?: string;
  children?: ReactNode;
  className?: string;
}

export function AsciiCard({
  title,
  description,
  href,
  tags,
  date,
  children,
  className = ""
}: AsciiCardProps) {
  const content = (
    <div className={`
      bg-card
      border border-border p-4
      card-hover
      group
      ${className}
    `}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-foreground font-bold group-hover:text-[var(--gradient-mid)] transition-colors duration-300">
          {title}
        </h3>
        {date && (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            [{date}]
          </span>
        )}
      </div>

      {description && (
        <p className="text-muted-foreground text-sm mb-3">
          {description}
        </p>
      )}

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {tags.map(tag => (
            <Badge
              key={tag}
              variant="outline"
              className="text-xs border-border text-muted-foreground transition-colors duration-300 group-hover:border-[var(--gradient-mid)] group-hover:text-[var(--gradient-mid)]"
            >
              #{tag}
            </Badge>
          ))}
        </div>
      )}

      {children}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block no-underline hover:no-underline">
        {content}
      </Link>
    );
  }

  return content;
}

export function AsciiProjectCard({
  title,
  description,
  href,
  tags,
  status,
  github,
  demo
}: AsciiCardProps & {
  status?: 'active' | 'completed' | 'archived' | 'wip';
  github?: string;
  demo?: string;
}) {
  const statusLabels = {
    active: 'active',
    completed: 'done',
    archived: 'archived',
    wip: 'wip'
  };

  const statusColors = {
    active: 'text-green-400',
    completed: 'text-blue-400',
    archived: 'text-gray-400',
    wip: 'text-amber-400'
  };

  return (
    <AsciiCard
      title={title}
      description={description}
      href={href}
      tags={tags}
    >
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border transition-colors duration-300">
        <div className="flex items-center gap-3 text-xs">
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[var(--gradient-mid)] transition-colors duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              [src]
            </a>
          )}
          {demo && (
            <a
              href={demo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-[var(--gradient-mid)] transition-colors duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              [demo]
            </a>
          )}
        </div>
        {status && (
          <span className={`text-xs ${statusColors[status]}`}>
            [{statusLabels[status]}]
          </span>
        )}
      </div>
    </AsciiCard>
  );
}

export function AsciiBlogCard({
  title,
  description,
  href,
  tags,
  date,
  readTime,
  image,
  imageAlt
}: AsciiCardProps & {
  readTime?: string;
  image?: string | null;
  imageAlt?: string | null;
}) {
  return (
    <AsciiCard
      title={title}
      description={description}
      href={href}
      tags={tags}
      date={date}
    >
      {image && (
        <div className="mt-3 mb-2 overflow-hidden border border-border">
          <img
            src={image}
            alt={imageAlt || title}
            className="w-full h-32 object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      {readTime && (
        <div className="text-xs text-muted-foreground mt-2">
          ~ {readTime} read
        </div>
      )}
    </AsciiCard>
  );
}
