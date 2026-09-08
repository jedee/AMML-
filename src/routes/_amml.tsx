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
  const { session } = useAmmlStore();
  const navigate = useNavigate();

  // Guard routing - redirect to /login if no valid session
  useEffect(() => {
    if (!session) {
      navigate({ to: '/login' });
    }
  }, [session, navigate]);

  if (!session) return null;

  return <OperationsShell />;
}
