import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface MedicalShop {
    id: bigint;
    name: string;
    description: string;
    website?: string;
    address: string;
    phone: string;
}
export type Result = {
    __kind__: "ok";
    ok: null;
} | {
    __kind__: "err";
    err: string;
};
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
export interface backendInterface {
    addShop(name: string, address: string, phone: string, website: string | null, description: string): Promise<Result>;
    checkAndUpdateAvailability(): Promise<void>;
    getAllDonors(): Promise<Array<DonorPublicView>>;
    getMyProfile(): Promise<DonorPublicView | null>;
    getShops(): Promise<Array<MedicalShop>>;
    logDonation(): Promise<Result>;
    registerDonor(name: string, address: string, bloodType: string, phone: string, lat: number, lng: number): Promise<Result>;
    searchDonors(bloodType: string, seekerLat: number, seekerLng: number): Promise<Array<DonorPublicView>>;
    updateDonorProfile(name: string, address: string, phone: string, lat: number, lng: number): Promise<Result>;
}
