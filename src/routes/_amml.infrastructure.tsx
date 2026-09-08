import { createRoute } from '@tanstack/react-router';
import { Route as AmmlLayoutRoute } from './_amml';
import { InfrastructureMonitoringDashboard } from '../components/amml/InfrastructureMonitoringDashboard';

export const Route = createRoute({
  getParentRoute: () => AmmlLayoutRoute,
  path: '/infrastructure',
  component: InfrastructureRouteComponent,
});

function InfrastructureRouteComponent() {
  return (
    <div id="amml-infrastructure-route-view" className="p-2 sm:p-4">
      <InfrastructureMonitoringDashboard />
    </div>
  );
}
