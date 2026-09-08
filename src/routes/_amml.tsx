import { useEffect } from 'react';
import { createRoute, useNavigate } from '@tanstack/react-router';
import { Route as RootRoute } from './__root';
import { useAmmlStore } from '../lib/amml/store';
import { OperationsShell } from '../components/amml/OperationsShell';

export const Route = createRoute({
  getParentRoute: () => RootRoute,
  id: '_amml',
  component: AmmlLayoutComponent,
});

function AmmlLayoutComponent() {
  const { session, isAuthReady } = useAmmlStore();
  const navigate = useNavigate();

  // Guard routing - redirect to /login only when auth is resolved and no valid session
  useEffect(() => {
    if (isAuthReady && !session) {
      navigate({ to: '/login' });
    }
  }, [session, isAuthReady, navigate]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-amml-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-amml-blue border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-mono text-amml-text3 tracking-wider">Verifying AMML Security Session...</span>
        </div>
      </div>
    );
  }

  if (!session) return null;

  return <OperationsShell />;
}
