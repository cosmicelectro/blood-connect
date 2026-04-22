import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createActor } from "../backend";
import type { DonorPublicView, MedicalShop, Result } from "../types";

function useBackendActor() {
  return useActor(createActor);
}

export function useAllDonors() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<DonorPublicView[]>({
    queryKey: ["donors", "all"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllDonors();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSearchDonors(
  bloodType: string,
  seekerLat: number,
  seekerLng: number,
  enabled: boolean,
) {
  const { actor, isFetching } = useBackendActor();
  return useQuery<DonorPublicView[]>({
    queryKey: ["donors", "search", bloodType, seekerLat, seekerLng],
    queryFn: async () => {
      if (!actor) return [];
      return actor.searchDonors(bloodType, seekerLat, seekerLng);
    },
    enabled: !!actor && !isFetching && enabled && bloodType !== undefined,
  });
}

export function useMyProfile() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<DonorPublicView | null>({
    queryKey: ["donor", "profile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useShops() {
  const { actor, isFetching } = useBackendActor();
  return useQuery<MedicalShop[]>({
    queryKey: ["shops"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getShops();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useRegisterDonor() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<
    Result,
    Error,
    {
      name: string;
      address: string;
      bloodType: string;
      phone: string;
      lat: number;
      lng: number;
    }
  >({
    mutationFn: async ({ name, address, bloodType, phone, lat, lng }) => {
      if (!actor) throw new Error("Not connected");
      return actor.registerDonor(name, address, bloodType, phone, lat, lng);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donor", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["donors"] });
    },
  });
}

export function useUpdateProfile() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<
    Result,
    Error,
    { name: string; address: string; phone: string; lat: number; lng: number }
  >({
    mutationFn: async ({ name, address, phone, lat, lng }) => {
      if (!actor) throw new Error("Not connected");
      return actor.updateDonorProfile(name, address, phone, lat, lng);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donor", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["donors"] });
    },
  });
}

export function useLogDonation() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<Result, Error>({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.logDonation();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donor", "profile"] });
      queryClient.invalidateQueries({ queryKey: ["donors"] });
    },
  });
}

export function useAddShop() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<
    Result,
    Error,
    {
      name: string;
      address: string;
      phone: string;
      website: string | null;
      description: string;
    }
  >({
    mutationFn: async ({ name, address, phone, website, description }) => {
      if (!actor) throw new Error("Not connected");
      return actor.addShop(name, address, phone, website, description);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["shops"] });
    },
  });
}

export function useCheckAvailability() {
  const { actor } = useBackendActor();
  const queryClient = useQueryClient();
  return useMutation<void, Error>({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      return actor.checkAndUpdateAvailability();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["donors"] });
      queryClient.invalidateQueries({ queryKey: ["donor", "profile"] });
    },
  });
}
