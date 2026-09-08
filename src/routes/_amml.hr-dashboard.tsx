import { createRoute } from '@tanstack/react-router';
import { Route as AmmlLayoutRoute } from './_amml';
import { HRPersonnelDashboard } from '../components/amml/HRPersonnelDashboard';

export const Route = createRoute({
  getParentRoute: () => AmmlLayoutRoute,
  path: '/hr-dashboard',
  component: HRDashboardRouteComponent,
});

function HRDashboardRouteComponent() {
  return (
    <div id="amml-hr-dashboard-route-view" className="p-2 sm:p-4">
      <HRPersonnelDashboard />
    </div>
  );
}
