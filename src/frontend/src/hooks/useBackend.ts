import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalDb } from "./useLocalDb";

function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371.0;
  const dLat = (lat2 - lat1) * (Math.PI / 180.0);
  const dLng = (lng2 - lng1) * (Math.PI / 180.0);
  const a = Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0)
    + Math.cos(lat1 * (Math.PI / 180.0)) * Math.cos(lat2 * (Math.PI / 180.0))
      * Math.sin(dLng / 2.0) * Math.sin(dLng / 2.0);
  const c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
  return R * c;
}

export function useAllDonors() {
  return useQuery({
    queryKey: ["donors"],
    queryFn: async () => {
      const db = useLocalDb.getState();
      return db.donors.map((d) => ({
        id: d.id,
        name: d.name,
        address: d.address,
        phone: d.phone,
        bloodType: d.bloodType,
        isAvailable: d.isAvailable,
        lat: d.lat,
        lng: d.lng,
        distanceKm: 0,
        donationCount: d.donationCount,
      }));
    },
  });
}

export function useSearchDonors(
  bloodType: string,
  seekerLat: number,
  seekerLng: number,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ["donors-search", bloodType, seekerLat, seekerLng],
    enabled,
    queryFn: async () => {
      const db = useLocalDb.getState();
      let list = db.donors.filter((d) => d.isAvailable);

      if (bloodType && bloodType !== "All") {
        list = list.filter((d) => d.bloodType === bloodType);
      }

      const mapped = list.map((d) => {
        const dist = (seekerLat !== 0 || seekerLng !== 0) 
          ? haversineKm(seekerLat, seekerLng, d.lat, d.lng)
          : 0;
        return {
          id: d.id,
          name: d.name,
          address: d.address,
          phone: d.phone,
          bloodType: d.bloodType,
          isAvailable: d.isAvailable,
          lat: d.lat,
          lng: d.lng,
          distanceKm: Number(dist.toFixed(1)),
          donationCount: d.donationCount,
        };
      });

      // Sort by distance if seeker location is present
      if (seekerLat !== 0 || seekerLng !== 0) {
        mapped.sort((a, b) => a.distanceKm - b.distanceKm);
      }

      return mapped;
    },
  });
}

export function useMyProfile() {
  return useQuery({
    queryKey: ["my-profile"],
    queryFn: async () => {
      const db = useLocalDb.getState();
      const user = db.currentUser;
      if (!user) return null;

      const donor = db.donors.find((d) => d.id === user.id);
      if (!donor) return null;

      return {
        id: donor.id,
        name: donor.name,
        address: donor.address,
        phone: donor.phone,
        bloodType: donor.bloodType,
        isAvailable: donor.isAvailable,
        lat: donor.lat,
        lng: donor.lng,
        distanceKm: 0,
        donationCount: donor.donationCount,
      };
    },
  });
}

export function useRegisterDonor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form: any) => {
      const db = useLocalDb.getState();
      db.addDonor({
        id: form.id || (db.currentUser?.id || "donor-self"),
        name: form.name,
        phone: form.phone,
        address: form.address,
        bloodType: form.bloodType,
        lat: form.lat,
        lng: form.lng,
      });

      return {
        __kind__: "ok",
        ok: null,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      queryClient.invalidateQueries({ queryKey: ["donors"] });
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form: any) => {
      const db = useLocalDb.getState();
      db.updateDonor(form.id, {
        name: form.name,
        address: form.address,
        phone: form.phone,
        lat: form.lat,
        lng: form.lng,
      });

      return {
        __kind__: "ok",
        ok: null,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      queryClient.invalidateQueries({ queryKey: ["donors"] });
    },
  });
}

export function useLogDonation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: string; date?: number }) => {
      const db = useLocalDb.getState();
      db.logDonation(payload.id, payload.date);

      return {
        __kind__: "ok",
        ok: null,
      };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["my-profile"],
      });

      queryClient.invalidateQueries({
        queryKey: ["donors"],
      });
    },
  });
}

export function useAddShop() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shop: any) => {
      const db = useLocalDb.getState();
      db.addShop({
        name: shop.name,
        description: shop.description,
        address: shop.address,
        phone: shop.phone,
        website: shop.website,
        ownerId: db.currentUser?.id,
        products: [],
      });

      return {
        __kind__: "ok",
        ok: null,
      };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
    },
  });
}

export function useCheckAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const db = useLocalDb.getState();
      db.checkAvailability();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donors"] });
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
    },
  });
}

export function useShops() {
  return useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const db = useLocalDb.getState();
      return db.shops;
    },
  });
}

// ── New Messaging and Feedback Hooks ──

export function useMessages(userId: string) {
  return useQuery({
    queryKey: ["messages", userId],
    queryFn: async () => {
      const db = useLocalDb.getState();
      return db.messages.filter((m) => m.senderId === userId || m.receiverId === userId);
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { senderId: string; senderName: string; receiverId: string; text: string }) => {
      const db = useLocalDb.getState();
      db.sendMessage(payload.senderId, payload.senderName, payload.receiverId, payload.text);
      return { ok: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["messages", variables.senderId] });
      queryClient.invalidateQueries({ queryKey: ["messages", variables.receiverId] });
    },
  });
}

export function useSubmitReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { userId: string; userName: string; category: any; message: string }) => {
      const db = useLocalDb.getState();
      db.submitReport(payload.userId, payload.userName, payload.category, payload.message);
      return { ok: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useReports() {
  return useQuery({
    queryKey: ["reports"],
    queryFn: async () => {
      const db = useLocalDb.getState();
      return db.reports;
    },
  });
}

export function useUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const db = useLocalDb.getState();
      return db.users;
    },
  });
}

export function useUpdateUserRole() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { userId: string; newRole: any }) => {
      const db = useLocalDb.getState();
      db.updateUserRole(payload.userId, payload.newRole);
      return { ok: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      queryClient.invalidateQueries({ queryKey: ["donors"] });
    },
  });
}