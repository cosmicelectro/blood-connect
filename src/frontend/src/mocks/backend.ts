import type { backendInterface } from "../backend";

export const mockBackend: backendInterface = {
  addShop: async () => ({ __kind__: "ok", ok: null }),

  checkAndUpdateAvailability: async () => undefined,

  getAllDonors: async () => [
    {
      id: "donor-1",
      lat: 23.8103,
      lng: 90.4125,
      bloodType: "A+",
      name: "Rahul Ahmed",
      isAvailable: true,
      distanceKm: 1.2,
      address: "Dhanmondi, Dhaka",
      phone: "+880 1711-234567",
    },
    {
      id: "donor-2",
      lat: 23.7461,
      lng: 90.3742,
      bloodType: "O+",
      name: "Fatima Khanam",
      isAvailable: false,
      distanceKm: 2.5,
      address: "Mohammadpur, Dhaka",
      phone: "+880 1812-345678",
    },
    {
      id: "donor-3",
      lat: 23.7925,
      lng: 90.4078,
      bloodType: "B+",
      name: "Karim Hossain",
      isAvailable: true,
      distanceKm: 3.8,
      address: "Mirpur, Dhaka",
      phone: "+880 1912-456789",
    },
  ],

  getMyProfile: async () => ({
    id: "donor-self",
    lat: 23.8103,
    lng: 90.4125,
    bloodType: "A+",
    name: "Rahul Ahmed",
    isAvailable: true,
    distanceKm: 0,
    address: "Dhanmondi, Dhaka",
    phone: "+880 1711-234567",
  }),

  getShops: async () => [
    {
      id: BigInt(1),
      name: "MedCare Pharmacy",
      description: "Full-service pharmacy with medical supplies and equipment",
      website: "https://medcare.example.com",
      address: "Gulshan-1, Dhaka",
      phone: "+880 2-9876543",
    },
    {
      id: BigInt(2),
      name: "HealthPlus Medical Store",
      description: "Diagnostic kits, surgical instruments and healthcare products",
      address: "Banani, Dhaka",
      phone: "+880 2-8765432",
    },
    {
      id: BigInt(3),
      name: "CityMed Supplies",
      description: "Wholesale and retail medical supplies for clinics and hospitals",
      website: "https://citymed.example.com",
      address: "Uttara, Dhaka",
      phone: "+880 2-7654321",
    },
  ],

  logDonation: async () => ({ __kind__: "ok", ok: null }),

  registerDonor: async () => ({ __kind__: "ok", ok: null }),

  searchDonors: async (bloodType: string) => [
    {
      id: "donor-1",
      lat: 23.8103,
      lng: 90.4125,
      bloodType,
      name: "Rahul Ahmed",
      isAvailable: true,
      distanceKm: 1.2,
      address: "Dhanmondi, Dhaka",
      phone: "+880 1711-234567",
    },
    {
      id: "donor-3",
      lat: 23.7925,
      lng: 90.4078,
      bloodType,
      name: "Karim Hossain",
      isAvailable: true,
      distanceKm: 3.8,
      address: "Mirpur, Dhaka",
      phone: "+880 1912-456789",
    },
  ],

  updateDonorProfile: async () => ({ __kind__: "ok", ok: null }),
};
