'use client';

import { useState, useEffect } from 'react';
import { AsciiSection, AsciiBox, AsciiDivider, AsciiPageLoader } from "@/components/ascii";
import { nowApi, NowUpdate } from "@/lib/api";

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

  if (isLoading) {
    return <AsciiPageLoader text="Loading" />;
  }

  if (!nowData) {
    return (
      <div className="space-y-8">
        <section className="border border-border p-6 bg-card">
          <h1 className="text-foreground text-xl mb-4">Now</h1>
          <AsciiDivider className="my-4" />
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
          <p className="text-muted-foreground mt-4">
            No updates yet. Check back soon!
          </p>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="border border-border p-6 bg-card">
        <h1 className="text-foreground text-xl mb-4">Now</h1>
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
          <div className="text-sm text-right whitespace-nowrap">
            {nowData.location && (
              <p className="text-muted-foreground">
                <span className="text-foreground">location:</span> {nowData.location}
              </p>
            )}
            <p className="text-muted-foreground">
              <span className="text-foreground">updated:</span>{" "}
              {new Date(nowData.updated_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </p>
          </div>
        </div>
      </section>

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

      <section className="border border-border p-4 bg-card">
        <div className="text-center text-muted-foreground text-sm">
          <p className="mb-2">
            Inspired by Derek Sivers&apos;{" "}
            <a
              href="https://sive.rs/nowff"
              target="_blank"
              rel="noopener noreferrer"
              className="text-foreground hover:underline"
            >
              /now page movement
            </a>
          </p>
          <pre className="text-xs text-border mt-4">
{`+-------------------------------------------+
|  "Focus is saying no to good ideas."      |
|                        - Steve Jobs       |
+-------------------------------------------+`}
          </pre>
        </div>
      </section>
    </div>
  );
}
