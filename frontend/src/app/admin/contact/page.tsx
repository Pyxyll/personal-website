'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { contactApi, ContactSubmission } from '@/lib/api';
import { Badge } from '@/components/ui/badge';

export default function AdminContactPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadSubmissions();
    }
  }, [isAuthenticated, filter]);

  const loadSubmissions = async () => {
    try {
      const params = filter === 'unread' ? { unread: true } : undefined;
      const data = await contactApi.getAll(params);
      setSubmissions(data);
    } catch (error) {
      console.error('Failed to load submissions:', error);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const handleMarkRead = async (id: number) => {
    try {
      const updated = await contactApi.markRead(id);
      setSubmissions(submissions.map((s) => (s.id === id ? updated : s)));
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(updated);
      }
    } catch (error) {
      console.error('Failed to mark as read:', error);
    }
  };

  const handleMarkUnread = async (id: number) => {
    try {
      const updated = await contactApi.markUnread(id);
      setSubmissions(submissions.map((s) => (s.id === id ? updated : s)));
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(updated);
      }
    } catch (error) {
      console.error('Failed to mark as unread:', error);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      await contactApi.delete(id);
      setSubmissions(submissions.filter((s) => s.id !== id));
      if (selectedSubmission?.id === id) {
        setSelectedSubmission(null);
      }
    } catch (error) {
      console.error('Failed to delete submission:', error);
    }
  };

  const handleSelect = async (submission: ContactSubmission) => {
    setSelectedSubmission(submission);
    if (!submission.read) {
      await handleMarkRead(submission.id);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const unreadCount = submissions.filter((s) => !s.read).length;

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="border border-border bg-card p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-foreground">Contact Submissions</h1>
              <p className="text-sm text-muted-foreground">
                {unreadCount > 0 ? `${unreadCount} unread message${unreadCount !== 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            <Link
              href="/admin"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              [Dashboard]
            </Link>
          </div>
        </header>

        <div className="border border-border bg-card p-4 mb-6">
          <div className="flex gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`text-sm ${filter === 'all' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              [All]
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`text-sm ${filter === 'unread' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
            >
              [Unread{unreadCount > 0 ? ` (${unreadCount})` : ''}]
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* List */}
          <div className="space-y-2">
            {isLoadingSubmissions ? (
              <div className="border border-border bg-card p-8 text-center">
                <p className="text-muted-foreground">Loading messages...</p>
              </div>
            ) : submissions.length === 0 ? (
              <div className="border border-border bg-card p-8 text-center">
                <p className="text-muted-foreground">
                  {filter === 'unread' ? 'No unread messages.' : 'No messages yet.'}
                </p>
              </div>
            ) : (
              submissions.map((submission) => (
                <button
                  key={submission.id}
                  onClick={() => handleSelect(submission)}
                  className={`w-full text-left border bg-card p-4 transition-colors ${
                    selectedSubmission?.id === submission.id
                      ? 'border-[var(--gradient-mid)]'
                      : 'border-border hover:border-foreground'
                  } ${!submission.read ? 'bg-[var(--gradient-mid)]/5' : ''}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium truncate ${!submission.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {submission.name}
                        </span>
                        {!submission.read && (
                          <Badge variant="outline" className="text-xs border-[var(--gradient-mid)] text-[var(--gradient-mid)]">
                            New
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {submission.email}
                      </p>
                      <p className="text-sm text-muted-foreground truncate mt-1">
                        {submission.message}
                      </p>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(submission.created_at)}
                    </span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Detail View */}
          <div className="border border-border bg-card p-6 lg:sticky lg:top-4 h-fit">
            {selectedSubmission ? (
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg text-foreground">{selectedSubmission.name}</h2>
                    <a
                      href={`mailto:${selectedSubmission.email}`}
                      className="text-sm text-[var(--gradient-mid)] hover:underline"
                    >
                      {selectedSubmission.email}
                    </a>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(selectedSubmission.created_at)}
                  </span>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-foreground whitespace-pre-wrap">
                    {selectedSubmission.message}
                  </p>
                </div>

                <div className="border-t border-border pt-4 flex gap-2 text-sm">
                  <a
                    href={`mailto:${selectedSubmission.email}?subject=Re: Your message`}
                    className="text-foreground hover:text-[var(--gradient-mid)]"
                  >
                    [Reply]
                  </a>
                  {selectedSubmission.read ? (
                    <button
                      onClick={() => handleMarkUnread(selectedSubmission.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      [Mark unread]
                    </button>
                  ) : (
                    <button
                      onClick={() => handleMarkRead(selectedSubmission.id)}
                      className="text-muted-foreground hover:text-foreground"
                    >
                      [Mark read]
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(selectedSubmission.id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    [Delete]
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Select a message to view</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {submissions.length} message{submissions.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
