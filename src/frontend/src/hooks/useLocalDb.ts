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
}

export interface LocalDonor {
  id: string;
  name: string;
  bloodType: string;
  phone: string;
  address: string;
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
   registerUser: (email: string, name: string, role: LocalUser["role"], password?: string) => LocalUser;
   updateUserEmail: (userId: string, newEmail: string) => void;
   updatePassword: (userId: string, newPassword: string) => void;
   adminChangeUserRole: (userId: string, newRole: LocalUser["role"]) => void;
   updateUserRole: (userId: string, newRole: LocalUser["role"]) => void;
  
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
  
  // Messaging actions
  sendMessage: (senderId: string, senderName: string, receiverId: string, text: string) => void;
  
  // Feedback actions
  submitReport: (userId: string, userName: string, category: FeedbackReport["category"], message: string) => void;
}

const FOUR_MONTHS_MS = 120 * 24 * 60 * 60 * 1000;

export const useLocalDb = create<LocalDbState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      language: "en",
      theme: "light",
      users: [
        { id: "admin-1", email: "admin@bloodconnect.org", name: "System Admin", role: "admin", password: "admin123" },
        { id: "donor-self", email: "donor@gmail.com", name: "Rahul Ahmed", role: "donor", password: "password123" },
        { id: "shopkeeper-1", email: "shop@medcare.com", name: "Mr. Kabir", role: "shopkeeper", password: "password123" },
        { id: "viewer-1", email: "viewer@gmail.com", name: "Sajid Hasan", role: "viewer", password: "password123" },
      ],
      donors: [
        {
          id: "donor-self",
          name: "Rahul Ahmed",
          bloodType: "A+",
          phone: "+880 1711-234567",
          address: "Dhanmondi, Dhaka",
          lat: 23.8103,
          lng: 90.4125,
          isAvailable: true,
          donationCount: 6,
        },
        {
          id: "donor-2",
          name: "Fatima Khanam",
          bloodType: "O+",
          phone: "+880 1812-345678",
          address: "Mohammadpur, Dhaka",
          lat: 23.7461,
          lng: 90.3742,
          isAvailable: false,
          lastDonationDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
          donationCount: 4,
        },
        {
          id: "donor-3",
          name: "Karim Hossain",
          bloodType: "B+",
          phone: "+880 1912-456789",
          address: "Mirpur, Dhaka",
          lat: 23.7925,
          lng: 90.4078,
          isAvailable: true,
          donationCount: 2,
        },
      ],
      shops: [
        {
          id: "shop-1",
          name: "MedCare Pharmacy",
          description: "Full-service pharmacy with medical supplies and equipment",
          website: "https://medcare.example.com",
          address: "Gulshan-1, Dhaka",
          phone: "+880 2-9876543",
          ownerId: "shopkeeper-1",
          products: [
            { name: "Blood Transfusion Set", price: 250 },
            { name: "Sterile Blood Bag 450ml", price: 1200 },
            { name: "Blood Grouping Reagents", price: 3500 },
          ],
        },
        {
          id: "shop-2",
          name: "HealthPlus Medical Store",
          description: "Diagnostic kits, surgical instruments and healthcare products",
          address: "Banani, Dhaka",
          phone: "+880 2-8765432",
          ownerId: "shopkeeper-1",
          products: [
            { name: "First Aid Kit Pro", price: 1500 },
            { name: "Disposable Syringes Pack of 100", price: 600 },
          ],
        },
      ],
      messages: [
        {
          id: "msg-1",
          senderId: "viewer-1",
          senderName: "Sajid Hasan",
          receiverId: "donor-self",
          text: "Hello, I need A+ blood urgently for my cousin at Dhanmondi Clinic. Are you available to donate today?",
          timestamp: Date.now() - 2 * 3600 * 1000,
        },
      ],
      reports: [
        {
          id: "rep-1",
          userId: "viewer-1",
          userName: "Sajid Hasan",
          category: "bug",
          message: "The search coordinates offset is slightly incorrect for Uttara location.",
          timestamp: Date.now() - 24 * 3600 * 1000,
        },
      ],
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
      setCurrentUser: (user) =>
        set({ currentUser: user }),
      updatePassword: (userId: string, newPassword: string) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, password: newPassword } : u)),
        })),
      registerUser: (email, name, role, password) =>
        {
          const id = Math.random().toString(36).substring(2, 9);
          const newUser: LocalUser = { id, email, name, role, password: password || "password123" };
          set((state) => ({ users: [...state.users, newUser] }));
          return newUser;
        },
      updateUserEmail: (userId, newEmail) =>
        set((state) => ({
          users: state.users.map((u) => (u.id === userId ? { ...u, email: newEmail } : u)),
        })),
      adminChangeUserRole: (userId, newRole) =>
        set((state) => {
          if (state.currentUser?.role !== "admin") {
            console.warn("Only admin can change other users' roles");
            return state;
          }
          const updatedUsers = state.users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
          const updatedCurrentUser =
            state.currentUser && state.currentUser.id === userId ? { ...state.currentUser, role: newRole } : state.currentUser;
          return { users: updatedUsers, currentUser: updatedCurrentUser };
        }),
      // New method to update any user's role (used by admin UI)
      updateUserRole: (userId, newRole) =>
        set((state) => {
          const updatedUsers = state.users.map((u) => (u.id === userId ? { ...u, role: newRole } : u));
          const updatedCurrentUser =
            state.currentUser && state.currentUser.id === userId ? { ...state.currentUser, role: newRole } : state.currentUser;
          return { users: updatedUsers, currentUser: updatedCurrentUser };
        }),
      addDonor: (donor) =>
        set((state) => ({
          donors: [...state.donors, { ...donor, isAvailable: true, donationCount: 0 }],
        })),
      updateDonor: (id, updatedFields) =>
        set((state) => ({
          donors: state.donors.map((d) => (d.id === id ? { ...d, ...updatedFields } : d)),
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
              : d
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
        set((state) => ({
          shops: [...state.shops, { ...shop, id }],
        }));
      },
      updateShop: (id, updatedFields) =>
        set((state) => ({
          shops: state.shops.map((s) => (s.id === id ? { ...s, ...updatedFields } : s)),
        })),
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
      addShopProduct: (shopId, product) =>
        set((state) => ({
          shops: state.shops.map((s) =>
            s.id === shopId
              ? { ...s, products: [...s.products, product] }
              : s
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
              : s
          ),
        })),
      sendMessage: (senderId, senderName, receiverId, text) => {
        const id = "msg-" + Math.random().toString(36).substring(2, 9);
        const newMsg: ChatMessage = { id, senderId, senderName, receiverId, text, timestamp: Date.now() };
        set((state) => ({
          messages: [...state.messages, newMsg],
        }));
      },
      submitReport: (userId, userName, category, message) => {
        const id = "rep-" + Math.random().toString(36).substring(2, 9);
        const newReport: FeedbackReport = { id, userId, userName, category, message, timestamp: Date.now() };
        set((state) => ({
          reports: [...state.reports, newReport],
        }));
      },
    }),
    {
      name: "blood-connect-db",
    }
  )
);
