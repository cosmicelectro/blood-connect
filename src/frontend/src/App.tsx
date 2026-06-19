import {
  Navigate,
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Layout } from "./components/Layout";
import { Toaster } from "./components/ui/sonner";
import { useAuth } from "./hooks/useAuth";
import { useLocalDb } from "./hooks/useLocalDb";
import {
  loadSharedState,
  saveSharedState,
  toSharedSnapshot,
} from "./lib/remoteStore";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AuthPage } from "./pages/AuthPage";
import { ChatPage } from "./pages/ChatPage";
import { DonorDashboard } from "./pages/DonorDashboard";
import { DonorRegisterPage } from "./pages/DonorRegisterPage";
import { ProfilePage } from "./pages/ProfilePage";
import { SearchPage } from "./pages/SearchPage";
import { ShopkeeperDashboard } from "./pages/ShopkeeperDashboard";
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

function DonorRouteComponent() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/auth" />;
  if (currentUser.role !== "donor") return <Navigate to="/" />;
  return <DonorDashboard />;
}

function ShopkeeperRouteComponent() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/auth" />;
  if (currentUser.role !== "shopkeeper") return <Navigate to="/" />;
  return <ShopkeeperDashboard />;
}

function AdminRouteComponent() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/auth" />;
  if (currentUser.role !== "admin") return <Navigate to="/" />;
  return <AdminDashboard />;
}

function ProfileRouteComponent() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/auth" />;
  return <ProfilePage />;
}

function ChatRouteComponent() {
  const { currentUser } = useAuth();
  if (!currentUser) return <Navigate to="/auth" />;
  return <ChatPage />;
}

const donorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/donor",
  component: DonorRouteComponent,
});

const shopkeeperRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/shopkeeper",
  component: ShopkeeperRouteComponent,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminRouteComponent,
});

const profileRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/profile",
  component: ProfileRouteComponent,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/chat",
  component: ChatRouteComponent,
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
  // const { resetStore } = useLocalDb();

  // // Reset store only when explicitly needed (e.g., via a dev query param)
  // // useEffect(() => {
  // //   if (process.env.NODE_ENV === "development") {
  // //     resetStore();
  // //   }
  // // }, [resetStore]);

  useEffect(() => {
    let cancelled = false;
    let saveTimer: ReturnType<typeof setTimeout> | null = null;
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    let hydrating = true;
    let lastRemoteUpdatedAt: string | null = null;
    let lastLocalSaveAt = 0;

    loadSharedState()
      .then((record) => {
        if (cancelled) return;

        if (record) {
          lastRemoteUpdatedAt = record.updatedAt;
          useLocalDb.getState().replaceSharedState(record.snapshot);
        } else {
          lastLocalSaveAt = Date.now();
          saveSharedState(toSharedSnapshot(useLocalDb.getState()));
        }
      })
      .finally(() => {
        hydrating = false;
      });

    const unsubscribe = useLocalDb.subscribe((state) => {
      if (hydrating) return;
      if (Date.now() - lastLocalSaveAt < 1200) return;
      if (saveTimer) clearTimeout(saveTimer);

      saveTimer = setTimeout(() => {
        lastLocalSaveAt = Date.now();
        saveSharedState(toSharedSnapshot(state));
      }, 400);
    });

    pollTimer = setInterval(() => {
      loadSharedState().then((record) => {
        if (!record || cancelled) return;
        if (record.updatedAt && record.updatedAt !== lastRemoteUpdatedAt) {
          lastRemoteUpdatedAt = record.updatedAt;
          hydrating = true;
          useLocalDb.getState().replaceSharedState(record.snapshot);
          hydrating = false;
        }
      });
    }, 5000);

    return () => {
      cancelled = true;
      if (saveTimer) clearTimeout(saveTimer);
      if (pollTimer) clearInterval(pollTimer);
      unsubscribe();
    };
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster richColors position="top-right" />
    </>
  );
}
