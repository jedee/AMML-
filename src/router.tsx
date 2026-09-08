import { createRouter } from '@tanstack/react-router';
import { Route as RootRoute } from './routes/__root';
import { Route as IndexRoute } from './routes/index';
import { Route as LoginRoute } from './routes/login';
import { Route as AmmlLayoutRoute } from './routes/_amml';
import { Route as DashboardRoute } from './routes/_amml.dashboard';
import { Route as ClassifierRoute } from './routes/_amml.classifier';
import { Route as DevicesRoute } from './routes/_amml.devices';
import { Route as MarketsRoute } from './routes/_amml.markets';
import { Route as InventoryRoute } from './routes/_amml.inventory';
import { Route as StaffRoute } from './routes/_amml.staff';
import { Route as AttendanceRoute } from './routes/_amml.attendance';
import { Route as PayrollRoute } from './routes/_amml.payroll';
import { Route as ReportsRoute } from './routes/_amml.reports';
import { Route as AuditRoute } from './routes/_amml.audit';
import { Route as UsersRoute } from './routes/_amml.users';
import { Route as SettingsRoute } from './routes/_amml.settings';
import { Route as TerminalRoute } from './routes/_amml.terminal';
import { Route as AlertsRoute } from './routes/_amml.alerts';
import { Route as InsightsRoute } from './routes/_amml.insights';
import { Route as TelemetryRoute } from './routes/_amml.telemetry';
import { Route as LeaveRoute } from './routes/_amml.leave';
import { Route as InfrastructureRoute } from './routes/_amml.infrastructure';
import { Route as HRDashboardRoute } from './routes/_amml.hr-dashboard';
import { Route as FilesRoute } from './routes/_amml.files';

const routeTree = RootRoute.addChildren([
  IndexRoute,
  LoginRoute,
  AmmlLayoutRoute.addChildren([
    DashboardRoute,
    ClassifierRoute,
    DevicesRoute,
    MarketsRoute,
    InventoryRoute,
    TelemetryRoute,
    InfrastructureRoute,
    HRDashboardRoute,
    FilesRoute,
    StaffRoute,
    AttendanceRoute,
    PayrollRoute,
    LeaveRoute,
    ReportsRoute,
    AuditRoute,
    UsersRoute,
    SettingsRoute,
    TerminalRoute,
    AlertsRoute,
    InsightsRoute,
  ]),
]);

export const router = createRouter({
  routeTree,
  defaultPreload: 'intent',
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
