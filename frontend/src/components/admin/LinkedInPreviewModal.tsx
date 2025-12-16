'use client';

import { useState } from 'react';
import { linkedinApi, BlogPost } from '@/lib/api';
import { AsciiDivider } from '@/components/ascii';

interface LinkedInPreviewModalProps {
  post: BlogPost;
  onClose: () => void;
  onSuccess: () => void;
}

export function LinkedInPreviewModal({ post, onClose, onSuccess }: LinkedInPreviewModalProps) {
  const [content, setContent] = useState(
    post.description + '\n\nRead more on my blog!'
  );
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState('');

  const handlePost = async () => {
    setError('');
    setIsPosting(true);

    try {
      const response = await linkedinApi.post(post.id, content);
      if (response.success) {
        onSuccess();
      } else {
        setError(response.message || 'Failed to post to LinkedIn');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || 'Failed to post to LinkedIn');
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-border">
          <h2 className="text-foreground text-lg">Post to LinkedIn</h2>
          <p className="text-sm text-muted-foreground">
            Preview and customize your LinkedIn post
          </p>
        </div>

        <div className="p-4 space-y-4">
          {error && (
            <div className="border border-red-500 bg-red-500/10 p-3 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm text-muted-foreground mb-1">
              Post Content
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={6}
              maxLength={3000}
              className="w-full bg-background border border-border p-2 text-foreground focus:outline-none focus:border-foreground resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              {content.length}/3000 characters
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground mb-2">Preview</p>
            <div className="border border-border bg-background p-4">
              <div className="flex gap-3">
                {post.featured_image && (
                  <img
                    src={post.featured_image}
                    alt={post.featured_image_alt || post.title}
                    className="w-16 h-16 object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground whitespace-pre-wrap break-words">
                    {content}
                  </p>
                  <AsciiDivider className="my-2" />
                  <div className="text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground">{post.title}</p>
                    <p>Your blog post link will be attached</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-border flex justify-end gap-4">
          <button
            onClick={onClose}
            disabled={isPosting}
            className="text-muted-foreground hover:text-foreground"
          >
            [Skip]
          </button>
          <button
            onClick={handlePost}
            disabled={isPosting || !content.trim()}
            className="border border-foreground bg-foreground text-background px-4 py-2 hover:bg-background hover:text-foreground transition-colors disabled:opacity-50"
          >
            {isPosting ? 'Posting...' : '[Post to LinkedIn]'}
          </button>
        </div>
      </div>
    </div>
  );
}
