'use client';

import { useState, useEffect } from 'react';
import { AsciiDivider } from '@/components/ascii';

type FormStep = 'name' | 'email' | 'message' | 'sending' | 'done' | 'already-sent';

const STORAGE_KEY = 'dylan-contact-sent';

export default function ContactPage() {
  const [step, setStep] = useState<FormStep>('name');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [hasSent, setHasSent] = useState(false);

  useEffect(() => {
    const sent = localStorage.getItem(STORAGE_KEY);
    if (sent) {
      setHasSent(true);
      setStep('already-sent');
    }
  }, []);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Come on, give me at least a couple characters!');
      return;
    }
    setError('');
    setStep('email');
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('That doesn\'t look quite right. Try again?');
      return;
    }
    setError('');
    setStep('message');
  };

  const handleMessageSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim().length < 10) {
      setError('Say a bit more! At least 10 characters.');
      return;
    }
    setError('');
    setStep('sending');

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, message }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      localStorage.setItem(STORAGE_KEY, new Date().toISOString());
      setHasSent(true);
      setStep('done');
    } catch {
      setError('Something went wrong. Try again?');
      setStep('message');
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <section className="border border-border p-6 bg-card">
        <h1 className="text-xl text-foreground mb-4">Get in Touch</h1>
        <AsciiDivider className="my-4" />

        <div className="space-y-6 text-muted-foreground">
          {/* Name Step */}
          {step === 'name' && (
            <form onSubmit={handleNameSubmit} className="space-y-4">
              <p className="text-foreground">Hey! What should I call you?</p>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                autoFocus
                className="w-full bg-background border border-border px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--gradient-mid)]"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="btn-modern px-6 py-2 text-foreground"
              >
                [Next]
              </button>
            </form>
          )}

          {/* Email Step */}
          {step === 'email' && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <p className="text-foreground">
                Nice to meet you, <span className="text-[var(--gradient-mid)]">{name}</span>! What&apos;s your email?
              </p>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                autoFocus
                className="w-full bg-background border border-border px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--gradient-mid)]"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('name')}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  [Back]
                </button>
                <button
                  type="submit"
                  className="btn-modern px-6 py-2 text-foreground"
                >
                  [Next]
                </button>
              </div>
            </form>
          )}

          {/* Message Step */}
          {step === 'message' && (
            <form onSubmit={handleMessageSubmit} className="space-y-4">
              <p className="text-foreground">
                Awesome! So, what&apos;s on your mind?
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Your message..."
                rows={5}
                autoFocus
                className="w-full bg-background border border-border px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-[var(--gradient-mid)] resize-none"
              />
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setStep('email')}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  [Back]
                </button>
                <button
                  type="submit"
                  className="btn-modern px-6 py-2 text-foreground"
                >
                  [Send it!]
                </button>
              </div>
            </form>
          )}

          {/* Sending Step */}
          {step === 'sending' && (
            <div className="text-center py-8">
              <p className="text-foreground">Sending your message...</p>
              <div className="mt-4 text-[var(--gradient-mid)]">
                {'['.padEnd(20, '=').padEnd(30, ' ') + ']'}
              </div>
            </div>
          )}

          {/* Done Step */}
          {step === 'done' && (
            <div className="space-y-4">
              <p className="text-foreground">
                Thanks, <span className="text-[var(--gradient-mid)]">{name}</span>! Your message is on its way.
              </p>
              <p>
                I&apos;ll get back to you at <span className="text-foreground">{email}</span> as soon as I can.
              </p>
            </div>
          )}

          {/* Already Sent Step */}
          {step === 'already-sent' && (
            <div className="space-y-4">
              <p className="text-foreground">
                You&apos;ve already sent me a message!
              </p>
              <p>
                I&apos;ll get back to you soon. If it&apos;s urgent, you can email me directly at{' '}
                <a href="mailto:hello@dylancollins.me" className="text-[var(--gradient-mid)] hover:underline">
                  hello@dylancollins.me
                </a>
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
