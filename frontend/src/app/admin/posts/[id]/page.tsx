'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { postsApi, BlogPost } from '@/lib/api';
import { PostEditor } from '@/components/admin/PostEditor';

export default function EditPostPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoadingPost, setIsLoadingPost] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && params.id) {
      loadPost();
    }
  }, [isAuthenticated, params.id]);

  const loadPost = async () => {
    try {
      const data = await postsApi.adminGetById(Number(params.id));
      setPost(data);
    } catch (error) {
      console.error('Failed to load post:', error);
      router.push('/admin/posts');
    } finally {
      setIsLoadingPost(false);
    }
  };

  if (isLoading || !isAuthenticated || isLoadingPost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Post not found</p>
      </div>
    );
  }

  return <PostEditor post={post} />;
}
