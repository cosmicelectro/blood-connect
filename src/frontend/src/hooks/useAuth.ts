import { useLocalDb } from "./useLocalDb";

export function useAuth() {
  const {
    currentUser,
    setCurrentUser,
    registerUser,
    users,
    language,
    theme,
    setLanguage,
    setTheme,
    updatePassword,
    adminChangeUserRole,
    verifyUser,
  } = useLocalDb();

  const loginWithOAuth = (
    provider: "google" | "facebook",
    defaultRole: "donor" | "shopkeeper" | "viewer",
    email?: string,
  ) => {
    // Use provided email if given, otherwise generate a simulated one
    const userEmail = email?.trim()
      ? email
      : `oauth-${defaultRole}@${provider}.com`;
    const safeUsers = users || [];
    let user = safeUsers.find((u) => u && u.email === userEmail);
    if (!user) {
      user = registerUser(
        userEmail,
        `${defaultRole.charAt(0).toUpperCase() + defaultRole.slice(1)} User`,
        defaultRole,
        "oauth-pass",
      );
    }
    setCurrentUser(user);
    return user;
  };

  const loginWithCredentials = (email: string, password?: string) => {
    const safeUsers = users || [];
    let user = safeUsers.find(
      (u) => u && typeof u.email === "string" && u.email.toLowerCase() === email.toLowerCase(),
    );
    if (!user) {
      const lowerEmail = email.toLowerCase();
      if (lowerEmail === "admin@bloodconnect.org") {
        user = registerUser("admin@bloodconnect.org", "System Admin", "admin", password || "password");
        verifyUser(user.id);
        user.isVerified = true;
      } else if (lowerEmail === "donor@bloodconnect.org") {
        user = registerUser("donor@bloodconnect.org", "John Donor", "donor", password || "password");
        verifyUser(user.id);
        user.isVerified = true;
      } else if (lowerEmail === "shopkeeper@bloodconnect.org") {
        user = registerUser("shopkeeper@bloodconnect.org", "Abir Shopkeeper", "shopkeeper", password || "password");
        verifyUser(user.id);
        user.isVerified = true;
      } else if (lowerEmail === "viewer@bloodconnect.org") {
        user = registerUser("viewer@bloodconnect.org", "Tanvir Seeker", "viewer", password || "password");
        verifyUser(user.id);
        user.isVerified = true;
      }
    }
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

  const registerNewProfile = (
    email: string,
    name: string,
    role: "donor" | "shopkeeper" | "viewer",
    password?: string,
    locationData?: {
      division?: string;
      district?: string;
      subDistrict?: string;
      area?: string;
      lat?: number;
      lng?: number;
    },
  ) => {
    const safeUsers = users || [];
    const existing = safeUsers.find(
      (u) => u && typeof u.email === "string" && u.email.toLowerCase() === email.toLowerCase(),
    );
    if (existing) {
      throw new Error("Email already registered. Please login instead.");
    }
    const newUser = registerUser(email, name, role, password);
    verifyUser(newUser.id);
    newUser.isVerified = true;

    // Create donor profile automatically if they signed up as a donor
    if (role === "donor") {
      const { addDonor } = useLocalDb.getState();
      addDonor({
        id: newUser.id,
        name: newUser.name,
        bloodType: "O+", // Default blood type for fast registration
        phone: "01700000000",
        address: locationData?.area || "Sylhet",
        division: locationData?.division || "Sylhet",
        district: locationData?.district || "Sylhet",
        subDistrict: locationData?.subDistrict || "Sylhet Sadar",
        area: locationData?.area || "Sylhet",
        lat: locationData?.lat || 24.8949,
        lng: locationData?.lng || 91.8687,
      });
    }

    setCurrentUser(newUser);
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
