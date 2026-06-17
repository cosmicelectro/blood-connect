export const DIVISIONS = [
  "Dhaka",
  "Chittagong",
  "Rajshahi",
  "Khulna",
  "Sylhet",
  "Barisal",
  "Rangpur",
];

export const DISTRICTS_BY_DIVISION: Record<string, string[]> = {
  Dhaka: ["Dhaka", "Gazipur", "Narayanganj", "Kishoreganj"],
  Chittagong: ["Chittagong", "Cox's Bazar", "Rangamati"],
  Rajshahi: ["Rajshahi", "Sirajganj", "Pabna"],
  Khulna: ["Khulna", "Jessore", "Satkhira"],
  Sylhet: ["Sylhet", "Moulvibazar", "Habiganj"],
  Barisal: ["Barisal", "Patuakhali"],
  Rangpur: ["Rangpur", "Dinajpur", "Thakurgaon"],
};

export const SUBDISTRICTS_BY_DISTRICT: Record<string, string[]> = {
  Dhaka: ["Dhanmondi", "Uttara", "Mirpur"],
  Gazipur: ["Tongi", "Kaliakoir"],
  Narayanganj: ["Daudkandi", "Shibchar"],
  Kishoreganj: ["Bajitpur", "Hossainpur"],
  // Add more as needed
};
