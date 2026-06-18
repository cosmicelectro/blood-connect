import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Product {
  name: string;
  price: number;
}

export interface LocalShop {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  website?: string;
  ownerId?: string;
  products: Product[];
  isVerified?: boolean;
  verificationMethod?: "phone" | "email";
}

export interface LocalDonor {
  id: string;
  name: string;
  bloodType: string;
  phone: string;
  address: string;
  division?: string;
  district?: string;
  subDistrict?: string;
  area?: string;
  lat: number;
  lng: number;
  isAvailable: boolean;
  lastDonationDate?: number; // millisecond timestamp
  donationCount: number;
}

export interface LocalUser {
  id: string;
  email: string;
  name: string;
  role: "admin" | "donor" | "shopkeeper" | "viewer";
  password?: string;
  isVerified?: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  text: string;
  timestamp: number;
}

export interface FeedbackReport {
  id: string;
  userId: string;
  userName: string;
  category: "bug" | "suggestion" | "other";
  message: string;
  timestamp: number;
}

interface LocalDbState {
  users: LocalUser[];
  donors: LocalDonor[];
  shops: LocalShop[];
  messages: ChatMessage[];
  reports: FeedbackReport[];
  currentUser: LocalUser | null;
  language: "en" | "bn";
  theme: "light" | "dark";

  // App preferences
  setLanguage: (lang: "en" | "bn") => void;
  setTheme: (theme: "light" | "dark") => void;
  // Auth actions
  setCurrentUser: (user: LocalUser | null) => void;
  registerUser: (
    email: string,
    name: string,
    role: LocalUser["role"],
    password?: string,
  ) => LocalUser;
  updateUserEmail: (userId: string, newEmail: string) => void;
  updatePassword: (userId: string, newPassword: string) => void;
  adminChangeUserRole: (userId: string, newRole: LocalUser["role"]) => void;
  updateUserRole: (userId: string, newRole: LocalUser["role"]) => void;
  verifyUser: (userId: string) => void;

  // Donor actions
  addDonor: (donor: Omit<LocalDonor, "isAvailable" | "donationCount">) => void;
  updateDonor: (id: string, donor: Partial<LocalDonor>) => void;
  deleteDonor: (id: string) => void;
  logDonation: (id: string, date?: number) => void;
  checkAvailability: () => void;

  // Shop actions
  addShop: (shop: Omit<LocalShop, "id">) => void;
  updateShop: (id: string, shop: Partial<LocalShop>) => void;
  deleteShop: (id: string) => void;
  addShopProduct: (shopId: string, product: Product) => void;
  removeShopProduct: (shopId: string, index: number) => void;
  verifyShop: (shopId: string, method: "phone" | "email") => void;

  // Messaging actions
  sendMessage: (
    senderId: string,
    senderName: string,
    receiverId: string,
    text: string,
  ) => void;
  editMessage: (messageId: string, newText: string) => void;
  deleteMessage: (messageId: string) => void;
  deleteInbox: (partnerId: string) => void;

  // Feedback actions
  submitReport: (
    userId: string,
    userName: string,
    category: FeedbackReport["category"],
    message: string,
  ) => void;
  deleteReport: (reportId: string) => void;
  resetStore: () => void;
}

const FOUR_MONTHS_MS = 120 * 24 * 60 * 60 * 1000;

export const useLocalDb = create<LocalDbState>()(
  persist(
    (set, get) => ({
      users: [
        {
          id: "admin-id",
          email: "admin@bloodconnect.org",
          name: "System Admin",
          role: "admin",
          password: "password",
          isVerified: true,
        },
        {
          id: "donor-id",
          email: "donor@bloodconnect.org",
          name: "John Donor",
          role: "donor",
          password: "password",
          isVerified: true,
        },
        {
          id: "shopkeeper-id",
          email: "shopkeeper@bloodconnect.org",
          name: "Abir Shopkeeper",
          role: "shopkeeper",
          password: "password",
          isVerified: true,
        },
        {
          id: "viewer-id",
          email: "viewer@bloodconnect.org",
          name: "Tanvir Seeker",
          role: "viewer",
          password: "password",
          isVerified: true,
        }
      ],
      donors: [
        {
          id: "donor-id",
          name: "John Donor",
          bloodType: "O+",
          phone: "01712345678",
          address: "Sylhet Sadar",
          division: "Sylhet",
          district: "Sylhet",
          subDistrict: "Sylhet Sadar",
          area: "Zindabazar",
          lat: 24.8949,
          lng: 91.8687,
          isAvailable: true,
          donationCount: 5,
        }
      ],
      shops: [
        {
          id: "shopkeeper-id",
          name: "Sylhet Central Pharmacy",
          description: "All kinds of local and imported life saving medicines.",
          address: "Zindabazar, Sylhet",
          phone: "01812345678",
          website: "https://centralpharmacy.com",
          ownerId: "shopkeeper-id",
          products: [
            { name: "Paracetamol", price: 10 },
            { name: "Insulin", price: 450 }
          ],
          isVerified: true,
        }
      ],
      messages: [],
      reports: [],
      currentUser: null,
      language: "en",
      theme: "light",
      setLanguage: (lang) => set({ language: lang }),
      setTheme: (t) => {
        set({ theme: t });
        // React immediately in DOM
        if (t === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      },
      setCurrentUser: (user) => set({ currentUser: user }),
      resetStore: () =>
        set({
          users: [],
          donors: [],
          shops: [],
          messages: [],
          reports: [],
          currentUser: null,
        }),
      updatePassword: (userId: string, newPassword: string) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, password: newPassword } : u,
          ),
        })),
      registerUser: (email, name, role, password) => {
        const id = Math.random().toString(36).substring(2, 9);
        const newUser: LocalUser = {
          id,
          email,
          name,
          role,
          password: password || "password123",
          isVerified: false,
        };
        set((state) => ({ users: [...state.users, newUser] }));
        return newUser;
      },
      verifyUser: (userId) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, isVerified: true } : u,
          ),
          currentUser:
            state.currentUser?.id === userId
              ? { ...state.currentUser, isVerified: true }
              : state.currentUser,
        })),
      updateUserEmail: (userId, newEmail) =>
        set((state) => ({
          users: state.users.map((u) =>
            u.id === userId ? { ...u, email: newEmail } : u,
          ),
        })),
      adminChangeUserRole: (userId, newRole) =>
        set((state) => {
          if (state.currentUser?.role !== "admin") {
            console.warn("Only admin can change other users' roles");
            return state;
          }
          const updatedUsers = state.users.map((u) =>
            u.id === userId ? { ...u, role: newRole } : u,
          );
          const updatedCurrentUser =
            state.currentUser && state.currentUser.id === userId
              ? { ...state.currentUser, role: newRole }
              : state.currentUser;
          return { users: updatedUsers, currentUser: updatedCurrentUser };
        }),
      // New method to update any user's role (used by admin UI)
      updateUserRole: (userId, newRole) =>
        set((state) => {
          const updatedUsers = state.users.map((u) =>
            u.id === userId ? { ...u, role: newRole } : u,
          );
          const updatedCurrentUser =
            state.currentUser && state.currentUser.id === userId
              ? { ...state.currentUser, role: newRole }
              : state.currentUser;
          return { users: updatedUsers, currentUser: updatedCurrentUser };
        }),
      addDonor: (donor) =>
        set((state) => ({
          donors: [
            ...state.donors,
            { ...donor, isAvailable: true, donationCount: 0 },
          ],
        })),
      updateDonor: (id, updatedFields) =>
        set((state) => ({
          donors: state.donors.map((d) =>
            d.id === id ? { ...d, ...updatedFields } : d,
          ),
        })),
      deleteDonor: (id) =>
        set((state) => {
          const currentUser = state.currentUser;
          if (!currentUser || currentUser.role !== "admin") {
            console.warn("Only admin can delete donors");
            return state;
          }
          return {
            donors: state.donors.filter((d) => d.id !== id),
          };
        }),
      deleteShop: (id) =>
        set((state) => {
          const currentUser = state.currentUser;
          if (!currentUser || currentUser.role !== "admin") {
            // Not authorized; optionally show a toast in UI layer
            console.warn("Only admin can delete shops");
            return state;
          }
          return {
            shops: state.shops.filter((s) => s.id !== id),
          };
        }),
      verifyShop: (shopId, method) =>
        set((state) => {
          const shops = state.shops.map((s) =>
            s.id === shopId
              ? { ...s, isVerified: true, verificationMethod: method }
              : s,
          );
          return { shops };
        }),
      logDonation: (id, date) => {
        const donationTime = date || Date.now();
        set((state) => ({
          donors: state.donors.map((d) =>
            d.id === id
              ? {
                  ...d,
                  lastDonationDate: donationTime,
                  isAvailable: false,
                  donationCount: d.donationCount + 1,
                }
              : d,
          ),
        }));
      },
      checkAvailability: () => {
        const now = Date.now();
        set((state) => ({
          donors: state.donors.map((d) => {
            if (!d.isAvailable && d.lastDonationDate) {
              if (now - d.lastDonationDate >= FOUR_MONTHS_MS) {
                return { ...d, isAvailable: true };
              }
            }
            return d;
          }),
        }));
      },
      addShop: (shop) => {
        const id = "shop-" + Math.random().toString(36).substring(2, 9);
        // New shops start as unverified; verification must be performed separately
        const newShop = {
          ...shop,
          id,
          isVerified: false,
          verificationMethod: undefined,
        };
        set((state) => ({
          shops: [...state.shops, newShop],
        }));
      },
      updateShop: (id, updatedFields) =>
        set((state) => ({
          shops: state.shops.map((s) =>
            s.id === id ? { ...s, ...updatedFields } : s,
          ),
        })),
      addShopProduct: (shopId, product) =>
        set((state) => ({
          shops: state.shops.map((s) =>
            s.id === shopId ? { ...s, products: [...s.products, product] } : s,
          ),
        })),
      removeShopProduct: (shopId, index) =>
        set((state) => ({
          shops: state.shops.map((s) =>
            s.id === shopId
              ? {
                  ...s,
                  products: s.products.filter((_, idx) => idx !== index),
                }
              : s,
          ),
        })),
      sendMessage: (senderId, senderName, receiverId, text) => {
        const id = "msg-" + Math.random().toString(36).substring(2, 9);
        const newMsg: ChatMessage = {
          id,
          senderId,
          senderName,
          receiverId,
          text,
          timestamp: Date.now(),
        };
        set((state) => ({
          messages: [...state.messages, newMsg],
        }));
      },
      editMessage: (messageId, newText) => {
        set((state) => ({
          messages: state.messages.map((m) =>
            m.id === messageId
              ? { ...m, text: newText, timestamp: Date.now() }
              : m,
          ),
        }));
      },
      deleteInbox: (partnerId) => {
        const currentUserId = get().currentUser?.id;
        if (!currentUserId) return;
        set((state) => ({
          messages: state.messages.filter(
            (m) =>
              !(
                (m.senderId === currentUserId && m.receiverId === partnerId) ||
                (m.senderId === partnerId && m.receiverId === currentUserId)
              ),
          ),
        }));
      },

      deleteMessage: (messageId) => {
        set((state) => ({
          messages: state.messages.filter((m) => m.id !== messageId),
        }));
      },
      submitReport: (userId, userName, category, message) => {
        const id = "rep-" + Math.random().toString(36).substring(2, 9);
        const newReport: FeedbackReport = {
          id,
          userId,
          userName,
          category,
          message,
          timestamp: Date.now(),
        };
        set((state) => ({
          reports: [...state.reports, newReport],
        }));
      },
      deleteReport: (reportId) =>
        set((state) => ({
          reports: state.reports.filter((r) => r.id !== reportId),
        })),
    }),
    {
      name: "blood-connect-db",
      merge: (persistedState: any, currentState: LocalDbState) => {
        if (!persistedState) return currentState;
        const merged = { ...currentState, ...persistedState };
        
        // Ensure all state collections are arrays and fallback to initial defaults if corrupted
        merged.users = Array.isArray(merged.users) ? merged.users : currentState.users;
        merged.donors = Array.isArray(merged.donors) ? merged.donors : currentState.donors;
        merged.shops = Array.isArray(merged.shops) ? merged.shops : currentState.shops;
        merged.messages = Array.isArray(merged.messages) ? merged.messages : currentState.messages;
        merged.reports = Array.isArray(merged.reports) ? merged.reports : currentState.reports;

        // Guarantee that the default initial users are always present in the users list
        const defaultUsers = currentState.users || [];
        for (const defUser of defaultUsers) {
          const exists = merged.users.some(
            (u: any) => u && typeof u.email === "string" && u.email.toLowerCase() === defUser.email.toLowerCase()
          );
          if (!exists) {
            merged.users.push(defUser);
          }
        }

        // Validate currentUser to avoid crashes with partial/corrupted user objects
        if (merged.currentUser && (!merged.currentUser.email || !merged.currentUser.role)) {
          merged.currentUser = null;
        }

        return merged;
      },
    },
  ),
);
