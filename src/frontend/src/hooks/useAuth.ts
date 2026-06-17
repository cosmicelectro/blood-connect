import { useLocalDb } from "./useLocalDb";

export function useAuth() {
  const { currentUser, setCurrentUser, registerUser, users, changeRole, language, theme, setLanguage, setTheme } = useLocalDb();

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
    setCurrentUser(user);
    return user;
  };

  const registerNewProfile = (email: string, name: string, role: "donor" | "shopkeeper" | "viewer", password?: string) => {
    const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      throw new Error("Email already registered. Please login instead.");
    }
    const newUser = registerUser(email, name, role, password);
    setCurrentUser(newUser);
    return newUser;
  };

  const updatePassword = (oldPwd: string, newPwd: string) => {
    if (!currentUser) throw new Error("Not logged in");
    if (currentUser.password !== oldPwd) throw new Error("Old password incorrect");
    const db = useLocalDb.getState();
    db.updatePassword(currentUser.id, newPwd);
    // refresh currentUser
    setCurrentUser({ ...currentUser, password: newPwd });
  };
    setCurrentUser(null);
    // Hard refresh to home page to clear all UI dashboards
    window.location.href = "/";
  };

  return {
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
    changeRole: (newRole: "admin" | "donor" | "shopkeeper" | "viewer") => {
      if (!currentUser) return;
      const db = useLocalDb.getState();
      db.updateUserRole(currentUser.id, newRole);
    },
    updatePassword,
    loginStatus: currentUser ? "success" : "idle",
  };
}