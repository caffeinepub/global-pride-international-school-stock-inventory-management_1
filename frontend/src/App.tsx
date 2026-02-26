import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
  Outlet,
  useNavigate,
  useLocation,
} from "@tanstack/react-router";
import { useEffect } from "react";
import Login from "./components/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Inventory from "./pages/Inventory";
import Billing from "./pages/Billing";
import Reports from "./pages/Reports";
import { Toaster } from "@/components/ui/sonner";

const queryClient = new QueryClient();

const SESSION_KEY = "gpis_session";

function getSession(): boolean {
  try {
    return localStorage.getItem(SESSION_KEY) === "true";
  } catch {
    return false;
  }
}

// Auth guard component — synchronously checks session on every render
function AuthGuard({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const isAuth = getSession();

  useEffect(() => {
    if (!isAuth) {
      navigate({ to: "/login", replace: true });
    }
  }, [isAuth, navigate]);

  if (!isAuth) {
    return null;
  }

  return <>{children}</>;
}

// Login guard — redirect to dashboard if already logged in
function LoginGuard() {
  const navigate = useNavigate();
  const isAuth = getSession();

  useEffect(() => {
    if (isAuth) {
      navigate({ to: "/dashboard", replace: true });
    }
  }, [isAuth, navigate]);

  if (isAuth) {
    return null;
  }

  return <Login />;
}

// Protected layout wraps Layout with AuthGuard
function ProtectedLayout() {
  return (
    <AuthGuard>
      <Layout />
    </AuthGuard>
  );
}

// Root route
const rootRoute = createRootRoute({
  component: () => <Outlet />,
});

// Login route (public)
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/login",
  component: LoginGuard,
});

// Index route — redirect based on auth
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: function IndexRedirect() {
    const navigate = useNavigate();
    const isAuth = getSession();

    useEffect(() => {
      if (isAuth) {
        navigate({ to: "/dashboard", replace: true });
      } else {
        navigate({ to: "/login", replace: true });
      }
    }, [isAuth, navigate]);

    return null;
  },
});

// Protected layout route
const protectedLayoutRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: "protected",
  component: ProtectedLayout,
});

// Protected child routes
const dashboardRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/dashboard",
  component: Dashboard,
});

const inventoryRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/inventory",
  component: Inventory,
});

const billingRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/billing",
  component: Billing,
});

const reportsRoute = createRoute({
  getParentRoute: () => protectedLayoutRoute,
  path: "/reports",
  component: Reports,
});

// Catch-all route — redirect to login
const notFoundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "*",
  component: function NotFound() {
    const navigate = useNavigate();

    useEffect(() => {
      navigate({ to: "/login", replace: true });
    }, [navigate]);

    return null;
  },
});

const routeTree = rootRoute.addChildren([
  loginRoute,
  indexRoute,
  notFoundRoute,
  protectedLayoutRoute.addChildren([
    dashboardRoute,
    inventoryRoute,
    billingRoute,
    reportsRoute,
  ]),
]);

const router = createRouter({
  routeTree,
  defaultPreload: "intent",
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
