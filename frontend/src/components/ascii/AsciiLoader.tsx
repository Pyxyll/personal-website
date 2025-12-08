'use client';

interface AsciiLoaderProps {
  text?: string;
  className?: string;
}

export function AsciiLoader({ text = 'Loading', className = '' }: AsciiLoaderProps) {
  return (
    <div className={`flex flex-col items-center justify-center py-12 ${className}`}>
      <div className="text-muted-foreground font-mono text-sm">
        <span className="inline-block animate-pulse">[</span>
        <span className="inline-block mx-1">
          <span className="inline-block animate-[pulse_1s_ease-in-out_infinite]">.</span>
          <span className="inline-block animate-[pulse_1s_ease-in-out_0.2s_infinite]">.</span>
          <span className="inline-block animate-[pulse_1s_ease-in-out_0.4s_infinite]">.</span>
        </span>
        <span className="inline-block animate-pulse">]</span>
        <span className="ml-2">{text}</span>
        <span className="typing-cursor"></span>
      </div>
    </div>
  );
}

export function AsciiPageLoader({ text = 'Loading' }: { text?: string }) {
  return (
    <div className="space-y-8">
      <section className="border border-border p-6 bg-card">
        <AsciiLoader text={text} />
      </section>
    </div>
  );
}

export function AsciiCardLoader({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-border p-4 bg-card">
          <div className="space-y-3">
            <div className="h-5 w-3/4 shimmer rounded" />
            <div className="space-y-2">
              <div className="h-3 w-full shimmer rounded" />
              <div className="h-3 w-5/6 shimmer rounded" />
            </div>
            <div className="flex gap-2 pt-2">
              <div className="h-5 w-16 shimmer rounded" />
              <div className="h-5 w-16 shimmer rounded" />
              <div className="h-5 w-16 shimmer rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AsciiListLoader({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="border border-border p-4 bg-card">
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <div className="h-5 w-1/2 shimmer rounded" />
              <div className="h-4 w-20 shimmer rounded" />
            </div>
            <div className="h-3 w-full shimmer rounded" />
            <div className="h-3 w-2/3 shimmer rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
