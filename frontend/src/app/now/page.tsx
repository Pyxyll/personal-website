'use client';

import { useState, useEffect } from 'react';
import { AsciiSection, AsciiBox, AsciiDivider, AsciiLoader } from "@/components/ascii";
import { nowApi, NowUpdate } from "@/lib/api";

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "just now";
  if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
  }
  if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  }
  if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days === 1 ? "" : "s"} ago`;
  }
  if (diffInSeconds < 2592000) {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks} week${weeks === 1 ? "" : "s"} ago`;
  }
  if (diffInSeconds < 31536000) {
    const months = Math.floor(diffInSeconds / 2592000);
    return `${months} month${months === 1 ? "" : "s"} ago`;
  }
  const years = Math.floor(diffInSeconds / 31536000);
  return `${years} year${years === 1 ? "" : "s"} ago`;
}

export default function NowPage() {
  const [nowData, setNowData] = useState<NowUpdate | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadNow();
  }, []);

  const loadNow = async () => {
    try {
      const data = await nowApi.getCurrent();
      setNowData(data);
    } catch (error) {
      console.error('Failed to load now data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <section className="border border-border p-6 bg-card">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-foreground text-xl">Now</h1>
          <p className="text-sm text-muted-foreground">
            <span className="text-foreground">updated:</span>{" "}
            {isLoading ? "..." : nowData ? formatRelativeTime(nowData.updated_at) : "never"}
          </p>
        </div>
        <AsciiDivider className="my-4" />
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <p className="text-muted-foreground">
              This is a{" "}
              <a
                href="https://nownownow.com/about"
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground hover:underline"
              >
                /now page
              </a>
              . It&apos;s a snapshot of what I&apos;m currently focused on - the kind of
              things you&apos;d tell a friend you hadn&apos;t seen in a year.
            </p>
          </div>
          {nowData?.location && (
            <p className="text-sm text-muted-foreground whitespace-nowrap">
              <span className="text-foreground">location:</span> {nowData.location}
            </p>
          )}
        </div>
      </section>

      {isLoading ? (
        <AsciiLoader text="Loading updates" />
      ) : !nowData ? (
        <section className="border border-border p-6 bg-card">
          <p className="text-muted-foreground">
            No updates yet. Check back soon!
          </p>
        </section>
      ) : (
        <>
          {nowData.working_on && nowData.working_on.length > 0 && (
            <AsciiSection title="Working On">
              <AsciiBox>
                <ul className="space-y-2">
                  {nowData.working_on.map((item, index) => (
                    <li key={index} className="flex gap-2 text-muted-foreground">
                      <span className="text-foreground">-</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </AsciiBox>
            </AsciiSection>
          )}

          <div className="grid gap-8 md:grid-cols-2">
            {nowData.learning && nowData.learning.length > 0 && (
              <AsciiSection title="Learning">
                <AsciiBox>
                  <ul className="space-y-2">
                    {nowData.learning.map((item, index) => (
                      <li key={index} className="flex gap-2 text-muted-foreground">
                        <span className="text-foreground">*</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </AsciiBox>
              </AsciiSection>
            )}

            {nowData.reading && nowData.reading.length > 0 && (
              <AsciiSection title="Reading">
                <AsciiBox>
                  <ul className="space-y-2">
                    {nowData.reading.map((item, index) => (
                      <li key={index} className="flex gap-2 text-muted-foreground">
                        <span className="text-foreground">&gt;</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </AsciiBox>
              </AsciiSection>
            )}
          </div>

          {nowData.watching && nowData.watching.length > 0 && (
            <AsciiSection title="Watching/Listening">
              <AsciiBox>
                <ul className="space-y-2">
                  {nowData.watching.map((item, index) => (
                    <li key={index} className="flex gap-2 text-muted-foreground">
                      <span className="text-foreground">~</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </AsciiBox>
            </AsciiSection>
          )}

          {nowData.goals && nowData.goals.length > 0 && (
            <AsciiSection title="Current Goals">
              <div className="border border-border p-4 bg-card">
                <ul className="space-y-3">
                  {nowData.goals.map((item, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-border">[{" "}]</span>
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </AsciiSection>
          )}
        </>
      )}
    </div>
  );
}
