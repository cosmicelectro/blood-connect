import { create } from "zustand";
import { persist } from "zustand/middleware";
import { supabase } from "../lib/supabase";

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
      users: [],
      donors: [],
      shops: [],
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
      setCurrentUser: (user) => {
        set({ currentUser: user });
        // Trigger immediate sync to Supabase so that other components or subsequent ticks don't overwrite it
        const state = get();
        syncToSupabase({
          users: state.users,
          donors: state.donors,
          shops: state.shops,
          messages: state.messages,
          reports: state.reports,
        });
      },
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
          isVerified: true, // Auto-verify users upon registration to bypass code input alert
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
    },
  ),
);

let isSyncingToSupabase = false;
let isSyncingFromSupabase = false;
let lastSyncedDbString = "";

export const syncToSupabase = async (dbPayload: any) => {
  if (isSyncingToSupabase) return;
  isSyncingToSupabase = true;
  try {
    const dbString = JSON.stringify(dbPayload);
    lastSyncedDbString = dbString;

    await supabase
      .from("shops")
      .update({
        description: dbString,
      })
      .eq("name", "global-state");
  } catch (error) {
    console.error("Failed to sync to Supabase:", error);
  } finally {
    isSyncingToSupabase = false;
  }
};

export const syncFromSupabase = async () => {
  if (isSyncingFromSupabase || isSyncingToSupabase) return;
  isSyncingFromSupabase = true;
  try {
    const { data, error } = await supabase
      .from("shops")
      .select("description")
      .eq("name", "global-state")
      .maybeSingle();

    if (error) throw error;
    if (data && data.description) {
      const dbString = data.description;
      if (dbString !== lastSyncedDbString) {
        lastSyncedDbString = dbString;
        const parsed = JSON.parse(dbString);
        
        // Keep current login state intact so users don't get logged out during updates
        const currentLocalUser = useLocalDb.getState().currentUser;

        // If local user is verified, make sure they are verified in the incoming users list too
        let incomingUsers = parsed.users || [];
        if (currentLocalUser) {
          incomingUsers = incomingUsers.map((u: any) =>
            u.id === currentLocalUser.id || u.email.toLowerCase() === currentLocalUser.email.toLowerCase()
              ? { ...u, isVerified: currentLocalUser.isVerified || u.isVerified }
              : u
          );
        }

        useLocalDb.setState({
          users: incomingUsers,
          donors: parsed.donors || [],
          shops: parsed.shops || [],
          messages: parsed.messages || [],
          reports: parsed.reports || [],
          currentUser: currentLocalUser,
        });
      }
    }
  } catch (error) {
    console.error("Failed to sync from Supabase:", error);
  } finally {
    isSyncingFromSupabase = false;
  }
};

// Subscribe to store changes to trigger updates to Supabase
useLocalDb.subscribe((state) => {
  const dbPayload = {
    users: state.users,
    donors: state.donors,
    shops: state.shops,
    messages: state.messages,
    reports: state.reports,
  };
  const dbString = JSON.stringify(dbPayload);

  if (
    dbString !== lastSyncedDbString &&
    !isSyncingFromSupabase &&
    !isSyncingToSupabase
  ) {
    syncToSupabase(dbPayload);
  }
});
