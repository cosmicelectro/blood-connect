import { Button } from "@/components/ui/button";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Droplets,
  Heart,
  LogOut,
  Menu,
  Moon,
  RefreshCw,
  ShieldAlert,
  Store,
  Sun,
  User,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../hooks/useAuth";
import { ReportDialog } from "./ReportDialog";
import { RoleIcon } from "./RoleIcon";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);

  const {
    isLoading,
    isLoggedIn,
    login,
    logout,
    user,
    role,
    language,
    theme,
    setLanguage,
    setTheme,
  } = useAuth();

  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;
  const { t, i18n } = useTranslation();

  // Sync i18n language
  useEffect(() => {
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  // Sync dark theme on load
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Build nav items dynamically based on the current user's role
  const navItems = [
    { to: "/", label: t("searchDonors") },
    { to: "/shops", label: t("medicalShops") },
  ];

  if (isLoggedIn) {
    navItems.push({
      to: "/chat",
      label: language === "bn" ? "মেসেজ" : "Messages",
    });
    if (role === "admin") {
      navItems.push({ to: "/admin", label: t("adminPanel") });
    } else if (role === "donor") {
      navItems.push({ to: "/donor", label: t("donorDashboard") });
    } else if (role === "shopkeeper") {
      navItems.push({ to: "/shopkeeper", label: t("shopkeeperDashboard") });
    }
  }

  // Role change functionality removed; roles are fixed at registration.

  const getRoleBadgeColor = () => {
    switch (role) {
      case "admin":
        return "bg-red-500 text-white";
      case "shopkeeper":
        return "bg-blue-600 text-white";
      case "donor":
        return "bg-primary text-white";
      default:
        return "bg-emerald-600 text-white";
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground transition-colors duration-200">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-card shadow-sm">
        <div className="mx-auto flex h-16 w-full max-w-[1400px] items-center justify-between px-4">
          {/* Brand */}
          <Link
            to="/"
            className="flex items-center gap-2.5 transition-smooth hover:opacity-80"
            data-ocid="nav.logo_link"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Droplets
                className="h-5 w-5 text-primary-foreground animate-pulse"
                aria-hidden="true"
              />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">
              Blood<span className="text-primary">Connect</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav
            className="hidden items-center gap-1 md:flex flex-shrink-0"
            aria-label="Main navigation"
          >
            {navItems.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`rounded-md px-2 lg:px-3 py-2 text-sm font-medium transition-smooth ${
                  currentPath === link.to
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Global Controls & Auth Actions */}
          <div className="hidden items-center gap-2 lg:gap-3 md:flex">
            {/* Report Button */}
            {isLoggedIn && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setReportOpen(true)}
                className="text-xs text-muted-foreground hover:text-primary px-2"
              >
                {t("reportIssue")}
              </Button>
            )}

            {/* Language Switcher */}
            <select
              className="border border-border bg-card text-xs font-semibold rounded p-1 hover:bg-muted outline-none cursor-pointer"
              value={language}
              onChange={(e) => setLanguage(e.target.value as any)}
            >
              <option value="en">EN</option>
              <option value="bn">বাং</option>
            </select>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500" />
              )}
            </button>

            {/* Auth Actions */}
            {isLoggedIn ? (
              <div className="relative flex items-center gap-2">
                <div
                  className={`flex items-center gap-1.5 rounded-full px-2 lg:px-3 py-1 text-xs font-semibold uppercase tracking-wider ${getRoleBadgeColor()}`}
                >
                  <RoleIcon
                    role={role as any}
                    className="h-3.5 w-3.5 hidden lg:block"
                  />
                  {role}
                </div>
                <div className="text-sm font-semibold max-w-[120px] truncate hidden xl:block">
                  {user?.name}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  data-ocid="nav.logout_button"
                  className="gap-1.5"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  {t("logout")}
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                onClick={login}
                disabled={isLoading}
                data-ocid="nav.login_button"
              >
                {t("signInRegister")}
              </Button>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className="p-2 rounded text-muted-foreground"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? (
                <Moon className="h-4 w-4" />
              ) : (
                <Sun className="h-4 w-4 text-amber-500" />
              )}
            </button>
            <button
              type="button"
              className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="Open menu"
            >
              {menuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-border bg-card px-4 py-3 md:hidden">
            <nav className="flex flex-col gap-1">
              {navItems.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="rounded-md px-3 py-2.5 text-sm font-medium hover:bg-muted text-foreground"
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}

              <div className="flex items-center justify-between border-t border-border mt-2 pt-2 px-3">
                <span className="text-xs text-muted-foreground">
                  Language / ভাষা
                </span>
                <select
                  className="border border-border bg-card text-xs rounded p-1"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as any)}
                >
                  <option value="en">English</option>
                  <option value="bn">বাংলা</option>
                </select>
              </div>

              {isLoggedIn && (
                <div className="border-t border-border mt-2 pt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full mt-2 justify-start text-xs text-muted-foreground"
                    onClick={() => {
                      setReportOpen(true);
                      setMenuOpen(false);
                    }}
                  >
                    {t("reportIssue")}
                  </Button>
                </div>
              )}

              <div className="mt-2 border-t border-border pt-2">
                {isLoggedIn ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full gap-1.5"
                    onClick={() => {
                      logout();
                      setMenuOpen(false);
                    }}
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    {t("logout")}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      login();
                      setMenuOpen(false);
                    }}
                    disabled={isLoading}
                  >
                    {t("signInRegister")}
                  </Button>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="flex-1 bg-background text-foreground">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-6">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
                <Droplets className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-display font-semibold">
                Blood<span className="text-primary">Connect</span>
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              © {new Date().getFullYear()} {t("brandName")}. {t("brandTagline")}
            </p>
          </div>
        </div>
      </footer>

      <ReportDialog isOpen={reportOpen} onClose={() => setReportOpen(false)} />
    </div>
  );
}
