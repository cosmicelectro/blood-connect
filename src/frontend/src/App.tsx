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
import { ChatPage } from "./pages/ChatPage";
import { useAuth } from "./hooks/useAuth";
import { Navigate } from "@tanstack/react-router";
import { ProfilePage } from "./pages/ProfilePage";
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
  component: () => {
    const { currentUser } = useAuth();
    if (!currentUser) return <Navigate to="/auth" />;
    if (currentUser.role !== "donor") return <Navigate to="/" />;
    return <DonorDashboard />;
  },
});

const shopkeeperRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shopkeeper",
  component: () => {
    const { currentUser } = useAuth();
    if (!currentUser) return <Navigate to="/auth" />;
    if (currentUser.role !== "shopkeeper") return <Navigate to="/" />;
    return <ShopkeeperDashboard />;
  },
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: () => {
    const { currentUser } = useAuth();
    if (!currentUser) return <Navigate to="/auth" />;
    if (currentUser.role !== "admin") return <Navigate to="/" />;
    return <AdminDashboard />;
  },
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: () => {
    const { currentUser } = useAuth();
    if (!currentUser) return <Navigate to="/auth" />;
    return <ProfilePage />;
  },
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: () => {
    const { currentUser } = useAuth();
    if (!currentUser) return <Navigate to="/auth" />;
    return <ChatPage />;
  },
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



const routeTree = rootRoute.addChildren([
  indexRoute,
  shopsRoute,
  donorRoute,
  donorRegisterRoute,
  authRoute,
  adminRoute,
  shopkeeperRoute,
  profileRoute,
  chatRoute,
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
