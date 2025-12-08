'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { AsciiDivider } from '@/components/ascii';
import { contactApi } from '@/lib/api';

export default function AdminDashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      contactApi.getUnreadCount().then((data) => setUnreadCount(data.count)).catch(() => {});
    }
  }, [isAuthenticated]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="border border-border bg-card p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Logged in as {user?.email}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
                [View Site]
              </Link>
              <button
                onClick={handleLogout}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                [Logout]
              </button>
            </div>
          </div>
        </header>

        <div className="grid gap-6 md:grid-cols-2">
          <Link href="/admin/posts" className="block">
            <div className="border border-border bg-card p-6 hover:border-foreground transition-colors">
              <h2 className="text-lg text-foreground mb-2">Blog Posts</h2>
              <AsciiDivider className="mb-3" />
              <p className="text-muted-foreground text-sm">
                Create, edit, and manage blog posts. Control publishing status and featured posts.
              </p>
              <div className="mt-4 text-sm text-foreground">
                [Manage Posts -&gt;]
              </div>
            </div>
          </Link>

          <Link href="/admin/now" className="block">
            <div className="border border-border bg-card p-6 hover:border-foreground transition-colors">
              <h2 className="text-lg text-foreground mb-2">Now Page</h2>
              <AsciiDivider className="mb-3" />
              <p className="text-muted-foreground text-sm">
                Update your /now page with what you&apos;re currently working on, learning, and reading.
              </p>
              <div className="mt-4 text-sm text-foreground">
                [Update Now -&gt;]
              </div>
            </div>
          </Link>

          <Link href="/admin/projects" className="block">
            <div className="border border-border bg-card p-6 hover:border-foreground transition-colors">
              <h2 className="text-lg text-foreground mb-2">Projects</h2>
              <AsciiDivider className="mb-3" />
              <p className="text-muted-foreground text-sm">
                Create, edit, and manage your projects. Control featured status and display order.
              </p>
              <div className="mt-4 text-sm text-foreground">
                [Manage Projects -&gt;]
              </div>
            </div>
          </Link>

          <Link href="/admin/contact" className="block">
            <div className="border border-border bg-card p-6 hover:border-foreground transition-colors">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg text-foreground">Contact Messages</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-xs bg-[var(--gradient-mid)] text-white">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <AsciiDivider className="mb-3" />
              <p className="text-muted-foreground text-sm">
                View and respond to messages from the contact form.
              </p>
              <div className="mt-4 text-sm text-foreground">
                [View Messages -&gt;]
              </div>
            </div>
          </Link>

          <div className="border border-border bg-card p-6">
            <h2 className="text-lg text-foreground mb-2">Quick Links</h2>
            <AsciiDivider className="mb-3" />
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/admin/posts/new" className="text-muted-foreground hover:text-foreground">
                  - Create new post
                </Link>
              </li>
              <li>
                <Link href="/admin/now" className="text-muted-foreground hover:text-foreground">
                  - Update now page
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-muted-foreground hover:text-foreground">
                  - View blog
                </Link>
              </li>
              <li>
                <Link href="/now" className="text-muted-foreground hover:text-foreground">
                  - View now page
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
