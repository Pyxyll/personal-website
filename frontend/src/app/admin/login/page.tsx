'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { AsciiDivider } from '@/components/ascii';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push('/admin');
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      router.push('/admin');
    } catch {
      setError('Invalid credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="border border-border bg-card p-6">
          <h1 className="text-xl text-foreground mb-2">Admin Login</h1>
          <AsciiDivider className="mb-6" />

          {error && (
            <div className="border border-red-500 bg-red-500/10 p-3 mb-4 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-muted-foreground mb-1">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full border border-foreground bg-foreground text-background py-2 hover:bg-background hover:text-foreground transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Logging in...' : '[Login]'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
