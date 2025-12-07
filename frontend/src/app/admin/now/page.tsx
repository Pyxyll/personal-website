'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { nowApi, NowUpdate } from '@/lib/api';
import { AsciiDivider } from '@/components/ascii';

export default function AdminNowPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [updates, setUpdates] = useState<NowUpdate[]>([]);
  const [isLoadingUpdates, setIsLoadingUpdates] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);

  const emptyForm = {
    location: '',
    working_on: [''],
    learning: [''],
    reading: [''],
    watching: [''],
    goals: [''],
    is_current: true,
  };

  const [formData, setFormData] = useState(emptyForm);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      loadUpdates();
    }
  }, [isAuthenticated]);

  const loadUpdates = async () => {
    try {
      const data = await nowApi.adminGetAll();
      setUpdates(data);

      // Load current update into form
      const current = data.find((u) => u.is_current);
      if (current) {
        setEditingId(current.id);
        setFormData({
          location: current.location || '',
          working_on: current.working_on?.length ? current.working_on : [''],
          learning: current.learning?.length ? current.learning : [''],
          reading: current.reading?.length ? current.reading : [''],
          watching: current.watching?.length ? current.watching : [''],
          goals: current.goals?.length ? current.goals : [''],
          is_current: true,
        });
      }
    } catch (error) {
      console.error('Failed to load updates:', error);
    } finally {
      setIsLoadingUpdates(false);
    }
  };

  const handleArrayChange = (
    field: keyof typeof formData,
    index: number,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  const addArrayItem = (field: keyof typeof formData) => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...(prev[field] as string[]), ''],
    }));
  };

  const removeArrayItem = (field: keyof typeof formData, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: (prev[field] as string[]).filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const data = {
        location: formData.location || null,
        working_on: formData.working_on.filter(Boolean),
        learning: formData.learning.filter(Boolean),
        reading: formData.reading.filter(Boolean),
        watching: formData.watching.filter(Boolean),
        goals: formData.goals.filter(Boolean),
        is_current: formData.is_current,
      };

      if (editingId) {
        await nowApi.update(editingId, data);
      } else {
        const newUpdate = await nowApi.create(data);
        setEditingId(newUpdate.id);
      }

      await loadUpdates();
      setError('');
      alert('Now page updated successfully!');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to save update');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderArrayField = (
    label: string,
    field: keyof typeof formData,
    placeholder: string
  ) => {
    const items = formData[field] as string[];
    return (
      <div>
        <label className="block text-sm text-muted-foreground mb-2">
          {label}
        </label>
        <div className="space-y-2">
          {items.map((item, index) => (
            <div key={index} className="flex gap-2">
              <input
                type="text"
                value={item}
                onChange={(e) => handleArrayChange(field, index, e.target.value)}
                placeholder={placeholder}
                className="flex-1 bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground text-sm"
              />
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeArrayItem(field, index)}
                  className="text-red-400 hover:text-red-300 px-2"
                >
                  [-]
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={() => addArrayItem(field)}
          className="mt-2 text-sm text-muted-foreground hover:text-foreground"
        >
          [+ Add item]
        </button>
      </div>
    );
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="border border-border bg-card p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-foreground">Now Page</h1>
              <p className="text-sm text-muted-foreground">
                Update what you&apos;re currently up to
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/admin"
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                [Dashboard]
              </Link>
              <Link
                href="/now"
                className="text-sm text-muted-foreground hover:text-foreground"
                target="_blank"
              >
                [View Page]
              </Link>
            </div>
          </div>
        </header>

        {error && (
          <div className="border border-red-500 bg-red-500/10 p-3 mb-6 text-red-400 text-sm">
            {error}
          </div>
        )}

        {isLoadingUpdates ? (
          <div className="border border-border bg-card p-8 text-center">
            <p className="text-muted-foreground">Loading...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border border-border bg-card p-4">
              <h2 className="text-foreground mb-3">General Info</h2>
              <AsciiDivider className="mb-4" />

              <div>
                <label className="block text-sm text-muted-foreground mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, location: e.target.value }))
                  }
                  placeholder="Remote"
                  className="w-full bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground"
                />
              </div>
            </div>

            <div className="border border-border bg-card p-4">
              <h2 className="text-foreground mb-3">Working On</h2>
              <AsciiDivider className="mb-4" />
              {renderArrayField('Current Projects', 'working_on', 'Building a new feature...')}
            </div>

            <div className="border border-border bg-card p-4">
              <h2 className="text-foreground mb-3">Learning</h2>
              <AsciiDivider className="mb-4" />
              {renderArrayField('What you\'re learning', 'learning', 'Rust programming...')}
            </div>

            <div className="border border-border bg-card p-4">
              <h2 className="text-foreground mb-3">Reading</h2>
              <AsciiDivider className="mb-4" />
              {renderArrayField('Books, articles, etc.', 'reading', '"The Pragmatic Programmer"')}
            </div>

            <div className="border border-border bg-card p-4">
              <h2 className="text-foreground mb-3">Watching/Listening</h2>
              <AsciiDivider className="mb-4" />
              {renderArrayField('Media consumption', 'watching', 'Conference talks...')}
            </div>

            <div className="border border-border bg-card p-4">
              <h2 className="text-foreground mb-3">Current Goals</h2>
              <AsciiDivider className="mb-4" />
              {renderArrayField('Goals you\'re working towards', 'goals', 'Ship 3 open source contributions')}
            </div>

            <div className="flex items-center justify-end gap-4">
              <Link
                href="/admin"
                className="text-muted-foreground hover:text-foreground"
              >
                [Cancel]
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="border border-foreground bg-foreground text-background px-6 py-2 hover:bg-background hover:text-foreground transition-colors disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : '[Save Changes]'}
              </button>
            </div>
          </form>
        )}

        {updates.length > 1 && (
          <div className="mt-8">
            <h2 className="text-foreground mb-4">Previous Updates</h2>
            <AsciiDivider className="mb-4" />
            <div className="space-y-2">
              {updates
                .filter((u) => !u.is_current)
                .map((update) => (
                  <div
                    key={update.id}
                    className="border border-border bg-card p-3 flex items-center justify-between"
                  >
                    <span className="text-sm text-muted-foreground">
                      {new Date(update.created_at).toLocaleDateString()} -{' '}
                      {update.location || 'No location'}
                    </span>
                    <button
                      onClick={async () => {
                        if (confirm('Make this the current update?')) {
                          await nowApi.update(update.id, { is_current: true });
                          await loadUpdates();
                        }
                      }}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      [Set as Current]
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
