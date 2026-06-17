import { useLocalDb } from "./useLocalDb";

export function useAuth() {
  const { currentUser, setCurrentUser, registerUser, users, language, theme, setLanguage, setTheme, updatePassword, adminChangeUserRole, verifyUser } = useLocalDb();

  const loginWithOAuth = (provider: "google" | "facebook", defaultRole: "donor" | "shopkeeper" | "viewer", email?: string) => {
  // Use provided email if given, otherwise generate a simulated one
  const userEmail = email?.trim() ? email : `oauth-${defaultRole}@${provider}.com`;
  let user = users.find((u) => u.email === userEmail);
  if (!user) {
    user = registerUser(
      userEmail,
      `${defaultRole.charAt(0).toUpperCase() + defaultRole.slice(1)} User`,
      defaultRole,
      "oauth-pass"
    );
  }
  setCurrentUser(user);
  return user;
};

  const loginWithCredentials = (email: string, password?: string) => {
    const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      throw new Error("User not found. Please register a profile first.");
    }
    if (password && user.password !== password) {
      throw new Error("Incorrect password. Please try again.");
    }
    if (user.isVerified === false) {
      throw new Error("unverified:" + user.id);
    }
    setCurrentUser(user);
    return user;
  };

  const registerNewProfile = (email: string, name: string, role: "donor" | "shopkeeper" | "viewer", password?: string) => {
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error("Email already registered. Please login instead.");
    }
    const newUser = registerUser(email, name, role, password);
    // Do not setCurrentUser here since they are unverified
    // setCurrentUser(newUser); 
    return newUser;
  };


  // Logout function to clear user session and refresh
  const logout = () => {
    setCurrentUser(null);
    // Hard refresh to home page to clear all UI dashboards
    window.location.href = "/";
  };

  return {
    currentUser,
    user: currentUser,
    identity: currentUser,
    principal: currentUser,
    role: currentUser?.role || null,
    isLoggedIn: !!currentUser,
    isLoading: false,
    language,
    theme,
    setLanguage,
    setTheme,
    login: () => {
      window.location.href = "/auth";
    },
    logout,
    loginWithOAuth,
    loginWithCredentials,
    registerNewProfile,
    adminChangeUserRole,
    updatePassword,
    verifyUser,
    loginStatus: currentUser ? "success" : "idle",
  };
}