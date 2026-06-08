import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";

export function useAllDonors() {
  return useQuery({
    queryKey: ["donors"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("donors")
        .select("*");

      if (error) throw error;
      return (data || []).map((d) => ({
  id: d.id,
  name: d.name,
  address: d.address,
  phone: d.phone,
  bloodType: d.blood_type,
  isAvailable: d.available,
  lat: d.latitude,
  lng: d.longitude,
  distanceKm: 0,
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
    queryKey: ["donors-search", bloodType],
    enabled,
    queryFn: async () => {
      let query = supabase.from("donors").select("*");

      if (bloodType && bloodType !== "All") {
        query = query.eq("blood_type", bloodType);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map((d) => ({
  id: d.id,
  name: d.name,
  address: d.address,
  phone: d.phone,
  bloodType: d.blood_type,
  isAvailable: d.available,
  lat: d.latitude,
  lng: d.longitude,
  distanceKm: 0,
}));
    },
  });
}

export function useMyProfile() {
  return {
    data: null,
    isLoading: false,
  };
}

export function useRegisterDonor() {
  return useMutation({
    mutationFn: async (form: any) => {
      const { error } = await supabase
        .from("donors")
        .insert([
          {
            name: form.name,
            phone: form.phone,
            address: form.address,
            blood_type: form.bloodType,
            latitude: form.lat,
            longitude: form.lng,
            available: true,
          },
        ]);

      if (error) throw error;

      return {
        __kind__: "ok",
        ok: null,
      };
    },
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (form: any) => {
      const { error } = await supabase
        .from("donors")
        .update({
          name: form.name,
          address: form.address,
          phone: form.phone,
          latitude: form.lat,
          longitude: form.lng,
        })
        .eq("id", form.id);

      if (error) throw error;

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

export function useLogDonation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("donors")
        .update({
          available: false,
          last_donation: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

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
      const { error } = await supabase
        .from("shops")
        .insert([
          {
            name: shop.name,
            description: shop.description,
            address: shop.address,
            phone: shop.phone,
            website: shop.website,
          },
        ]);

      if (error) throw error;

      return {
        __kind__: "ok",
        ok: null,
      };
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["shops"],
      });
    },
  });
}

export function useCheckAvailability() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase
        .from("donors")
        .select("*")
        .eq("available", false);

      if (error) throw error;

      for (const donor of data || []) {
        if (!donor.last_donation) continue;

        const donationTime = new Date(
          donor.last_donation
        ).getTime();

        const now = Date.now();

        const fourMonths = 120 * 24 * 60 * 60 * 1000;

if (now - donationTime >= fourMonths) {
          await supabase
            .from("donors")
            .update({
              available: true,
            })
            .eq("id", donor.id);
        }
      }
    },

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["donors"],
      });

      queryClient.invalidateQueries({
        queryKey: ["my-profile"],
      });
    },
  });
}
export function useShops() {
  return useQuery({
    queryKey: ["shops"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("shops")
        .select("*");

      if (error) throw error;

      return data || [];
    },
  });
}