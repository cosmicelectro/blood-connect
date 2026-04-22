import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Layout } from "./components/Layout";
import { DonorDashboard } from "./pages/DonorDashboard";
import { DonorRegisterPage } from "./pages/DonorRegisterPage";
import { SearchPage } from "./pages/SearchPage";
import { ShopsPage } from "./pages/ShopsPage";

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
    </Layout>
  ),
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: SearchPage,
});

const shopsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shops",
  component: ShopsPage,
});

const donorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/donor",
  component: DonorDashboard,
});

const donorRegisterRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/donor/register",
  component: DonorRegisterPage,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  shopsRoute,
  donorRoute,
  donorRegisterRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
