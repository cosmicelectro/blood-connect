export function useAuth() {
  return {
    identity: null,
    isLoggedIn: true,
    isLoading: false,
    login: async () => {},
    logout: () => {},
    loginStatus: "success",
    principal: null,
  };
}