import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <div className="min-h-screen bg-amml-page font-sans text-gray-200 antialiased selection:bg-amml-green selection:text-amml-ink">
      <Outlet />
    </div>
  );
}
