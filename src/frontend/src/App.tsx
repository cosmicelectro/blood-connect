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
import { AuthPage } from "./pages/AuthPage";
import { AdminDashboard } from "./pages/AdminDashboard";
import { ShopkeeperDashboard } from "./pages/ShopkeeperDashboard";

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

const authRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth",
  component: AuthPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminDashboard,
});

const shopkeeperRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shopkeeper",
  component: ShopkeeperDashboard,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  shopsRoute,
  donorRoute,
  donorRegisterRoute,
  authRoute,
  adminRoute,
  shopkeeperRoute,
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
