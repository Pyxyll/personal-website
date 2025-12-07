'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { projectsApi, Project } from '@/lib/api';
import { ProjectEditor } from '@/components/admin/ProjectEditor';

export default function EditProjectPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const [project, setProject] = useState<Project | null>(null);
  const [isLoadingProject, setIsLoadingProject] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && params.id) {
      loadProject();
    }
  }, [isAuthenticated, params.id]);

  const loadProject = async () => {
    try {
      const data = await projectsApi.adminGetById(Number(params.id));
      setProject(data);
    } catch (error) {
      console.error('Failed to load project:', error);
      router.push('/admin/projects');
    } finally {
      setIsLoadingProject(false);
    }
  };

  if (isLoading || !isAuthenticated || isLoadingProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Project not found</p>
      </div>
    );
  }

  return <ProjectEditor project={project} />;
}
