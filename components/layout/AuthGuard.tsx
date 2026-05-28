'use client';

import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/Spinner';

const publicPaths = ['/', '/login', '/register'];
const authPaths = ['/login', '/register'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    const currentPath = pathname || '';
    const isPublicPath = publicPaths.includes(currentPath);
    const isAuthPath = authPaths.includes(currentPath);

    if (!user && !isPublicPath) {
      router.push('/login');
    } else if (user && isAuthPath) {
      router.push('/dashboard');
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-void">
        <div className="text-center space-y-4">
          <Spinner size="lg" />
          <p className="text-muted text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const currentPath = pathname || '';
  const isPublicPath = publicPaths.includes(currentPath);
  if (!user && !isPublicPath) {
    return null;
  }

  return <>{children}</>;
}
