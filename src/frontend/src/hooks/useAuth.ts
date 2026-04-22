import { useInternetIdentity } from "@caffeineai/core-infrastructure";

export function useAuth() {
  const { identity, login, clear, loginStatus } = useInternetIdentity();

  const isLoggedIn = loginStatus === "success" && identity !== null;
  const isLoading = loginStatus === "logging-in";

  return {
    identity,
    isLoggedIn,
    isLoading,
    login,
    logout: clear,
    loginStatus,
    principal: identity?.getPrincipal(),
  };
}
