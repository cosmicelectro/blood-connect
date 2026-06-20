import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalDb } from "./useLocalDb";

function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371.0;
  const dLat = (lat2 - lat1) * (Math.PI / 180.0);
  const dLng = (lng2 - lng1) * (Math.PI / 180.0);
  const a =
    Math.sin(dLat / 2.0) * Math.sin(dLat / 2.0) +
    Math.cos(lat1 * (Math.PI / 180.0)) *
      Math.cos(lat2 * (Math.PI / 180.0)) *
      Math.sin(dLng / 2.0) *
      Math.sin(dLng / 2.0);
  const c = 2.0 * Math.atan2(Math.sqrt(a), Math.sqrt(1.0 - a));
  return R * c;
}

function hasValidCoordinate(lat: number, lng: number) {
  return (
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    (lat !== 0 || lng !== 0) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

const LEGACY_SYLHET_FALLBACK = { lat: 24.8949, lng: 91.8687 };

const APPROXIMATE_LOCATION_COORDINATES: Record<
  string,
  { lat: number; lng: number }
> = {
  "sylhet|sylhet|sylhet sadar": { lat: 24.899, lng: 91.871 },
  "sylhet|habiganj|baniachong": { lat: 24.5167, lng: 91.3579 },
  "sylhet|sylhet|zakiganj": { lat: 24.8736, lng: 92.3608 },
  "mymensingh|mymensingh|mymensingh sadar": {
    lat: 24.7471,
    lng: 90.4203,
  },
  "mymensingh|mymensingh|trishal": { lat: 24.5789, lng: 90.3944 },
  "mymensingh|jamalpur|jamalpur sadar": { lat: 24.9197, lng: 89.9481 },
  "mymensingh|netrokona|netrokona sadar": { lat: 24.8835, lng: 90.7274 },
};

function locationKey(...parts: Array<string | undefined>) {
  return parts
    .map((part) => part?.trim().toLowerCase())
    .filter(Boolean)
    .join("|");
}

function isLegacyFallbackCoordinate(lat: number, lng: number) {
  return (
    Math.abs(lat - LEGACY_SYLHET_FALLBACK.lat) < 0.0001 &&
    Math.abs(lng - LEGACY_SYLHET_FALLBACK.lng) < 0.0001
  );
}

function resolveDonorCoordinate(donor: {
  division?: string;
  district?: string;
  subDistrict?: string;
  lat: number;
  lng: number;
}) {
  const approximate =
    APPROXIMATE_LOCATION_COORDINATES[
      locationKey(donor.division, donor.district, donor.subDistrict)
    ];

  if (
    approximate &&
    (!hasValidCoordinate(donor.lat, donor.lng) ||
      isLegacyFallbackCoordinate(donor.lat, donor.lng))
  ) {
    return { ...approximate, isApproximate: true };
  }

  return {
    lat: donor.lat,
    lng: donor.lng,
    isApproximate: false,
  };
}

export function useAllDonors() {
  const donors = useLocalDb((state) => state.donors);
  return useQuery({
    queryKey: ["donors", donors],
    queryFn: async () => {
      return donors.map((d) => ({
        id: d.id,
        name: d.name,
        address: d.address,
        phone: d.phone,
        bloodType: d.bloodType,
        division: d.division,
        district: d.district,
        subDistrict: d.subDistrict,
        area: d.area,
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
  division: string,
  district: string,
  subDistrict: string,
  area: string,
  seekerLat: number,
  seekerLng: number,
  enabled: boolean,
) {
  const donors = useLocalDb((state) => state.donors);
  const hasSeekerLocation = hasValidCoordinate(seekerLat, seekerLng);
  return useQuery({
    queryKey: [
      "donors-search",
      donors,
      bloodType,
      division,
      district,
      subDistrict,
      area,
      seekerLat,
      seekerLng,
    ],
    enabled,
    queryFn: async () => {
      let list = donors.filter((d) => d.isAvailable);

      if (bloodType && bloodType !== "All" && bloodType !== "all") {
        list = list.filter((d) => d.bloodType === bloodType);
      }
      if (division) {
        list = list.filter(
          (d) => d.division?.toLowerCase() === division.toLowerCase(),
        );
      }
      if (district) {
        list = list.filter(
          (d) => d.district?.toLowerCase() === district.toLowerCase(),
        );
      }
      if (subDistrict) {
        list = list.filter(
          (d) => d.subDistrict?.toLowerCase() === subDistrict.toLowerCase(),
        );
      }
      if (area) {
        list = list.filter((d) =>
          `${d.area || ""} ${d.address || ""}`
            .toLowerCase()
            .includes(area.toLowerCase()),
        );
      }

      const mapped = list.map((d) => {
        const donorCoordinate = resolveDonorCoordinate(d);
        const hasDonorLocation = hasValidCoordinate(
          donorCoordinate.lat,
          donorCoordinate.lng,
        );
        const dist =
          hasSeekerLocation && hasDonorLocation
            ? haversineKm(
                seekerLat,
                seekerLng,
                donorCoordinate.lat,
                donorCoordinate.lng,
              )
            : null;

        let matchScore = 0;
        if (area && d.area?.toLowerCase() === area.toLowerCase())
          matchScore += 1000;
        if (
          subDistrict &&
          d.subDistrict?.toLowerCase() === subDistrict.toLowerCase()
        )
          matchScore += 100;
        if (district && d.district?.toLowerCase() === district.toLowerCase())
          matchScore += 10;
        if (division && d.division?.toLowerCase() === division.toLowerCase())
          matchScore += 1;

        return {
          id: d.id,
          name: d.name,
          address: d.address,
          phone: d.phone,
          bloodType: d.bloodType,
          division: d.division,
          district: d.district,
          subDistrict: d.subDistrict,
          area: d.area,
          isAvailable: d.isAvailable,
          lat: donorCoordinate.lat,
          lng: donorCoordinate.lng,
          distanceKm: dist === null ? 0 : Number(dist.toFixed(2)),
          hasRealDistance: dist !== null,
          isApproximateDistance: donorCoordinate.isApproximate,
          donationCount: d.donationCount,
          matchScore,
        };
      });

      // Sort by match score first (descending), then by distance (ascending)
      mapped.sort((a, b) => {
        if (a.matchScore !== b.matchScore) {
          return b.matchScore - a.matchScore;
        }
        if (hasSeekerLocation) {
          if (a.hasRealDistance !== b.hasRealDistance) {
            return a.hasRealDistance ? -1 : 1;
          }
          return a.distanceKm - b.distanceKm;
        }
        return 0;
      });

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
        division: donor.division,
        district: donor.district,
        subDistrict: donor.subDistrict,
        area: donor.area,
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
        id: form.id || db.currentUser?.id || "donor-self",
        name: form.name,
        phone: form.phone,
        address: form.address,
        division: form.division,
        district: form.district,
        subDistrict: form.subDistrict,
        area: form.area,
        bloodType: form.bloodType,
        lat: form.lat || 0,
        lng: form.lng || 0,
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
        division: form.division,
        district: form.district,
        subDistrict: form.subDistrict,
        area: form.area,
        lat: form.lat || 0,
        lng: form.lng || 0,
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
      return { __kind__: "ok", ok: null };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
    },
  });
}

// Hook to verify a shop (phone or email)
export function useVerifyShop() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      shopId: string;
      method: "phone" | "email";
    }) => {
      const db = useLocalDb.getState();
      db.verifyShop(payload.shopId, payload.method);
      return { ok: true };
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
      return db.messages.filter(
        (m) => m.senderId === userId || m.receiverId === userId,
      );
    },
  });
}

// Hook to delete a message
export function useDeleteMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (messageId: string) => {
      const db = useLocalDb.getState();
      db.deleteMessage(messageId);
      return { ok: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

// Hook to edit a message
export function useEditMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      messageId,
      newText,
    }: { messageId: string; newText: string }) => {
      const db = useLocalDb.getState();
      db.editMessage(messageId, newText);
      return { ok: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}
export function useDeleteInbox() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (partnerId: string) => {
      const db = useLocalDb.getState();
      db.deleteInbox(partnerId);
      return { ok: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["messages"] });
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      senderId: string;
      senderName: string;
      receiverId: string;
      text: string;
    }) => {
      const db = useLocalDb.getState();
      db.sendMessage(
        payload.senderId,
        payload.senderName,
        payload.receiverId,
        payload.text,
      );
      return { ok: true };
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.senderId],
      });
      queryClient.invalidateQueries({
        queryKey: ["messages", variables.receiverId],
      });
    },
  });
}

export function useSubmitReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      userId: string;
      userName: string;
      category: any;
      message: string;
    }) => {
      const db = useLocalDb.getState();
      db.submitReport(
        payload.userId,
        payload.userName,
        payload.category,
        payload.message,
      );
      return { ok: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });
}

export function useDeleteReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reportId: string) => {
      const db = useLocalDb.getState();
      db.deleteReport(reportId);
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
