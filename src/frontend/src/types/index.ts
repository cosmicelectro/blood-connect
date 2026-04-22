export interface DonorPublicView {
  id: string;
  lat: number;
  lng: number;
  bloodType: string;
  name: string;
  isAvailable: boolean;
  distanceKm: number;
  address: string;
  phone: string;
}

export interface MedicalShop {
  id: bigint;
  name: string;
  description: string;
  website?: string;
  address: string;
  phone: string;
}

export type Result =
  | { __kind__: "ok"; ok: null }
  | { __kind__: "err"; err: string };

export const BLOOD_TYPES = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;
export type BloodType = (typeof BLOOD_TYPES)[number];
