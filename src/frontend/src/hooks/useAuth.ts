import { useLocalDb } from "./useLocalDb";

const normalizeMobile = (mobile: string) => mobile.replace(/\D/g, "");

export function useAuth() {
  const {
    currentUser,
    setCurrentUser,
    registerUser,
    language,
    theme,
    setLanguage,
    setTheme,
    updatePassword: updateStoredPassword,
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
    const safeUsers = useLocalDb.getState().users || [];
    let user = safeUsers.find((u) => u && u.email === userEmail);
    if (!user) {
      user = registerUser(
        userEmail,
        "",
        `${defaultRole.charAt(0).toUpperCase() + defaultRole.slice(1)} User`,
        defaultRole,
        "oauth-pass",
      );
    }
    setCurrentUser(user);
    return user;
  };

  const loginWithCredentials = (email: string, password?: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const safeUsers = useLocalDb.getState().users || [];
    let user = safeUsers.find(
      (u) =>
        u &&
        typeof u.email === "string" &&
        u.email.toLowerCase() === normalizedEmail,
    );
    if (!user) {
      if (normalizedEmail === "admin@bloodconnect.org") {
        user = registerUser(
          "admin@bloodconnect.org",
          "01700000001",
          "System Admin",
          "admin",
          password || "password",
        );
        verifyUser(user.id);
        user.isVerified = true;
      } else if (normalizedEmail === "donor@bloodconnect.org") {
        user = registerUser(
          "donor@bloodconnect.org",
          "01700000002",
          "John Donor",
          "donor",
          password || "password",
        );
        verifyUser(user.id);
        user.isVerified = true;
      } else if (normalizedEmail === "shopkeeper@bloodconnect.org") {
        user = registerUser(
          "shopkeeper@bloodconnect.org",
          "01700000003",
          "Abir Shopkeeper",
          "shopkeeper",
          password || "password",
        );
        verifyUser(user.id);
        user.isVerified = true;
      } else if (normalizedEmail === "viewer@bloodconnect.org") {
        user = registerUser(
          "viewer@bloodconnect.org",
          "01700000004",
          "Tanvir Seeker",
          "viewer",
          password || "password",
        );
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
      throw new Error(`unverified:${user.id}`);
    }
    setCurrentUser(user);
    return user;
  };

  const registerNewProfile = (
    email: string,
    mobile: string,
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
    const safeUsers = useLocalDb.getState().users || [];
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedMobile = normalizeMobile(mobile);
    if (!normalizedMobile) {
      throw new Error("Mobile number is required.");
    }
    const existing = safeUsers.find(
      (u) =>
        u &&
        typeof u.email === "string" &&
        (u.email.toLowerCase() === normalizedEmail ||
          normalizeMobile(u.mobile || "") === normalizedMobile),
    );
    if (existing) {
      throw new Error(
        "Email or mobile number already registered. Please login instead.",
      );
    }
    const newUser = registerUser(
      normalizedEmail,
      normalizedMobile,
      name,
      role,
      password,
    );
    verifyUser(newUser.id);
    newUser.isVerified = true;

    // Create donor profile automatically if they signed up as a donor
    if (role === "donor") {
      const { addDonor } = useLocalDb.getState();
      addDonor({
        id: newUser.id,
        name: newUser.name,
        bloodType: "O+", // Default blood type for fast registration
        phone: normalizedMobile,
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

  const updatePassword = (oldPassword: string, newPassword: string) => {
    const user = useLocalDb.getState().currentUser;
    if (!user) {
      throw new Error("You must be logged in to change your password.");
    }
    if (user.password !== oldPassword) {
      throw new Error("Current password is incorrect.");
    }
    if (newPassword.length < 8) {
      throw new Error("Password must be at least 8 characters long.");
    }
    updateStoredPassword(user.id, newPassword);
    setCurrentUser({ ...user, password: newPassword });
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
