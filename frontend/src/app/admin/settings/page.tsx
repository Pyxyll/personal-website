'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { linkedinApi } from '@/lib/api';
import { AsciiDivider } from '@/components/ascii';

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    checkLinkedInStatus();

    // Check for callback messages
    const linkedinStatus = searchParams.get('linkedin');
    if (linkedinStatus === 'success') {
      setMessage({ type: 'success', text: 'LinkedIn connected successfully!' });
      checkLinkedInStatus();
    } else if (linkedinStatus === 'error') {
      const errorMsg = searchParams.get('message') || 'Failed to connect LinkedIn';
      setMessage({ type: 'error', text: errorMsg });
    }
  }, [searchParams]);

  const checkLinkedInStatus = async () => {
    try {
      const status = await linkedinApi.getStatus();
      setLinkedInConnected(status.connected);
    } catch {
      setLinkedInConnected(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectLinkedIn = async () => {
    setConnecting(true);
    try {
      const { url } = await linkedinApi.getAuthUrl();
      window.location.href = url;
    } catch {
      setMessage({ type: 'error', text: 'Failed to initiate LinkedIn connection' });
      setConnecting(false);
    }
  };

  const handleDisconnectLinkedIn = async () => {
    try {
      await linkedinApi.disconnect();
      setLinkedInConnected(false);
      setMessage({ type: 'success', text: 'LinkedIn disconnected' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to disconnect LinkedIn' });
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="border border-border bg-card p-4 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-foreground">Settings</h1>
              <p className="text-sm text-muted-foreground">
                Manage integrations and preferences
              </p>
            </div>
            <Link
              href="/admin"
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              [Back to Dashboard]
            </Link>
          </div>
        </header>

        {message && (
          <div
            className={`border p-3 mb-6 text-sm ${
              message.type === 'success'
                ? 'border-green-500 bg-green-500/10 text-green-400'
                : 'border-red-500 bg-red-500/10 text-red-400'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="border border-border bg-card p-4">
          <h2 className="text-foreground mb-3">LinkedIn Integration</h2>
          <AsciiDivider className="mb-4" />

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Connect your LinkedIn account to automatically share blog posts when you publish them.
            </p>

            {loading ? (
              <p className="text-muted-foreground">Checking connection status...</p>
            ) : linkedInConnected ? (
              <div className="flex items-center gap-4">
                <span className="text-green-400">Connected</span>
                <button
                  onClick={handleDisconnectLinkedIn}
                  className="text-sm text-red-400 hover:text-red-300"
                >
                  [Disconnect]
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnectLinkedIn}
                disabled={connecting}
                className="border border-foreground bg-foreground text-background px-4 py-2 hover:bg-background hover:text-foreground transition-colors disabled:opacity-50"
              >
                {connecting ? 'Connecting...' : '[Connect LinkedIn]'}
              </button>
            )}

            <div className="text-xs text-muted-foreground mt-4">
              <p>Note: You&apos;ll need to set up LinkedIn API credentials in your backend .env file:</p>
              <pre className="mt-2 p-2 bg-background border border-border">
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
LINKEDIN_REDIRECT_URI=your_api_url/api/v1/linkedin/callback
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
