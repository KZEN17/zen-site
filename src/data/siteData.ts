export const siteConfig = {
  name: "ZEN House Calayo",
  tagline: "Beach Accommodation",
  description: "Your peaceful escape in Calayo, Nasugbu, Batangas, Philippines",
  contact: {
    phone: "+63 951 640 7886",
    email: "menikoloski0612@gmail.com",
    address: "Calayo, Nasugbu, Batangas, Philippines",
    mapUrl:
      "https://www.google.com/maps/place/Zenmart+Accommodation/@14.1508346,120.6074449,17z/data=!3m1!4b1!4m6!3m5!1s0x33bd932083277fcd:0xb5f15532695aecab!8m2!3d14.1508294!4d120.6100198!16s%2Fg%2F11txhtt79s?hl=en-US&entry=ttu&g_ep=EgoyMDI2MDEyMS4wIKXMDSoKLDEwMDc5MjA2N0gBUAM%3D",
    mapEmbed:
      "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3871.8562024674585!2d120.6074449!3d14.1508346!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33bd932083277fcd%3A0xb5f15532695aecab!2sZenmart%20Accommodation!5e0!3m2!1sen!2sph!4v1706200000000",
  },
  social: {
    facebook: "https://www.facebook.com/p/Zenhouse-calayo-100075945187126/",
    instagram:
      "https://www.instagram.com/explore/locations/106658485169841/zenhouse-calayo/",
  },
};

export interface RoomRate {
  guests: string; // e.g., "2-4 pax" or "5-8 pax"
  price: number;
}

export interface Room {
  id: string;
  name: string;
  capacity: string;
  features: string[];
  inclusions: string[];
  roomDetails?: string[];
  images: string[];
  rates: RoomRate[];
}

// Shared features for budget rooms (1-4)
const budgetRoomFeatures = [
  "2 minutes walking distance to beach",
  "24hrs beach access for free",
  "Free parking (1 car)",
  "Free WiFi",
  "Free kitchen use (refrigerator, gas stove, utensils)",
  "No hidden fees",
  "No corkage",
  "Pillows and blanket provided",
  "Extra mattress available",
  "Fine brown sand, kids friendly",
];

// Shared features for loft/ground floor rooms
const loftRoomFeatures = [
  "1 minute walking distance to beach",
  "24hrs beach access for free",
  "Free parking (1 car)",
  "Free WiFi",
  "Free kitchen use (refrigerator, gas stove, utensils)",
  "No hidden fees",
  "No corkage",
  "Pillows and blanket provided",
  "Extra mattress available",
  "Fine brown sand, kids friendly",
  "Private bathroom",
  "Free use of griller",
  "Rooftop access (beach/mountain view)",
  "Pet friendly",
];

export const rooms: Room[] = [
  {
    id: "room-1",
    name: "Room 1",
    capacity: "2-8 pax",
    features: budgetRoomFeatures,
    inclusions: [
      "Air conditioning",
      "Private bathroom",
      "Fresh linens and towels",
      "Beach access",
    ],
    images: [
      "/images/room1-1.jpeg",
      "/images/room1-2.jpeg",
      "/images/room1-3.jpeg",
    ],
    rates: [
      { guests: "2 pax", price: 2500 },
      { guests: "3-4 pax", price: 3500 },
      { guests: "5-7 pax", price: 4000 },
      { guests: "8 pax", price: 5000 },
    ],
  },
  {
    id: "room-2",
    name: "Room 2",
    capacity: "2-8 pax",
    features: budgetRoomFeatures,
    inclusions: [
      "Air conditioning",
      "Private bathroom",
      "Fresh linens and towels",
      "Beach access",
    ],
    images: [
      "/images/room2-1.jpeg",
      "/images/room1-1.jpeg",
      "/images/room1-3.jpeg",
    ],
    rates: [
      { guests: "2 pax", price: 2500 },
      { guests: "3-4 pax", price: 3500 },
      { guests: "5-7 pax", price: 4000 },
      { guests: "8 pax", price: 5000 },
    ],
  },
  {
    id: "room-3",
    name: "Room 3",
    capacity: "2-8 pax",
    features: budgetRoomFeatures,
    inclusions: [
      "Air conditioning",
      "Private bathroom",
      "Fresh linens and towels",
      "Beach access",
    ],
    images: [
      "/images/room-3-1.jpeg",
      "/images/room-3-2.jpeg",
      "/images/room-3-3.jpeg",
      "/images/room-3-4.jpeg",
    ],
    rates: [
      { guests: "2 pax", price: 2500 },
      { guests: "3-4 pax", price: 3500 },
      { guests: "5-7 pax", price: 4000 },
      { guests: "8 pax", price: 5000 },
    ],
  },
  {
    id: "room-4",
    name: "Room 4",
    capacity: "2-8 pax",
    features: budgetRoomFeatures,
    inclusions: [
      "Air conditioning",
      "Private bathroom",
      "Fresh linens and towels",
      "Beach access",
    ],
    images: [
      "/images/room-4-1.jpeg",
      "/images/room-4-2.jpeg",
      "/images/room-4-3.jpeg",
    ],
    rates: [
      { guests: "2 pax", price: 2500 },
      { guests: "3-4 pax", price: 3500 },
      { guests: "5-7 pax", price: 4000 },
      { guests: "8 pax", price: 5000 },
    ],
  },
  {
    id: "small-loft",
    name: "Small Loft",
    capacity: "2-7 pax",
    features: loftRoomFeatures,
    inclusions: [
      "1HP Split-type Aircon",
      "Private bathroom",
      "Kitchen with gas stove and electric kettle",
      "Refrigerator",
      "Free use of kitchen utensils",
    ],
    roomDetails: [
      "Loft bed with king sized mattress",
      "Single double deck",
      "King sized extra mattress",
    ],
    images: [
      "/images/small-loft-1.jpeg",
      "/images/small-loft-2.jpeg",
      "/images/small-loft-3.jpeg",
      "/images/rooftop-1.jpeg",
      "/images/rooftop-2.jpeg",
      "/images/rooftop-3.jpeg",
      "/images/rooftop-4.jpeg",
      "/images/rooftop-5.jpeg",
      "/images/rooftop-6.jpeg",
      "/images/rooftop-7.jpeg",
      "/images/rooftop-8.jpeg",
      "/images/rooftop-9.jpeg",
      "/images/rooftop-10.jpeg",
      "/images/rooftop-11.jpeg",
      "/images/rooftop-12.jpeg",
      "/images/rooftop-13.jpeg",
      "/images/rooftop-14.jpeg",
      "/images/rooftop-15.jpeg",
      "/images/rooftop-16.jpeg",
      "/images/rooftop-17.jpeg",
    ],
    rates: [
      { guests: "2-3 pax", price: 3000 },
      { guests: "4-5 pax", price: 4000 },
      { guests: "6-7 pax", price: 5000 },
    ],
  },
  {
    id: "big-loft",
    name: "Big Loft",
    capacity: "7-10 pax",
    features: loftRoomFeatures,
    inclusions: [
      "1HP Split-type Aircon",
      "Private bathroom",
      "Kitchen with gas stove and electric kettle",
      "Refrigerator",
      "Free use of kitchen utensils",
    ],
    roomDetails: [
      "Loft with 2 king sized beds",
      "King sized bed",
      "King sized extra mattress",
    ],
    images: [
      "/images/big-loft-1.jpeg",
      "/images/big-loft-2.jpeg",
      "/images/big-loft-3.jpeg",
      "/images/rooftop-1.jpeg",
      "/images/rooftop-2.jpeg",
      "/images/rooftop-3.jpeg",
      "/images/rooftop-4.jpeg",
      "/images/rooftop-5.jpeg",
      "/images/rooftop-6.jpeg",
      "/images/rooftop-7.jpeg",
      "/images/rooftop-8.jpeg",
      "/images/rooftop-9.jpeg",
      "/images/rooftop-10.jpeg",
      "/images/rooftop-11.jpeg",
      "/images/rooftop-12.jpeg",
      "/images/rooftop-13.jpeg",
      "/images/rooftop-14.jpeg",
      "/images/rooftop-15.jpeg",
      "/images/rooftop-16.jpeg",
      "/images/rooftop-17.jpeg",
    ],
    rates: [
      { guests: "7-9 pax", price: 6000 },
      { guests: "10 pax", price: 7000 },
    ],
  },
  {
    id: "ground-floor",
    name: "Ground Floor",
    capacity: "10-12 pax",
    features: loftRoomFeatures,
    inclusions: [
      "2.5HP Split-type Aircon",
      "Private bathroom",
      "Kitchen with gas stove and electric kettle",
      "Refrigerator",
      "Free use of kitchen utensils",
    ],
    roomDetails: ["3 double deck beds", "King sized extra mattress"],
    images: [
      "/images/ground-floor-1.jpeg",
      "/images/ground-floor-2.jpeg",
      "/images/ground-floor-3.jpeg",
      "/images/rooftop-1.jpeg",
      "/images/rooftop-2.jpeg",
      "/images/rooftop-3.jpeg",
      "/images/rooftop-4.jpeg",
      "/images/rooftop-5.jpeg",
      "/images/rooftop-6.jpeg",
      "/images/rooftop-7.jpeg",
      "/images/rooftop-8.jpeg",
      "/images/rooftop-9.jpeg",
      "/images/rooftop-10.jpeg",
      "/images/rooftop-11.jpeg",
      "/images/rooftop-12.jpeg",
      "/images/rooftop-13.jpeg",
      "/images/rooftop-14.jpeg",
      "/images/rooftop-15.jpeg",
      "/images/rooftop-16.jpeg",
      "/images/rooftop-17.jpeg",
    ],
    rates: [
      { guests: "10 pax", price: 7000 },
      { guests: "11-12 pax", price: 7500 },
    ],
  },
  {
    id: "full-house",
    name: "Full House",
    capacity: "Up to 20 pax",
    features: [
      "2 AC rooms (8-10 pax each)",
      "Smart TV with Netflix",
      "2 toilets & extra bathroom",
      "Spacious living room",
      "2 minutes walk to beach",
      "24hrs beach access",
      "Free parking (1 car)",
      "Free WiFi",
      "Free kitchen use with complete utensils",
      "Dining area for gatherings & karaoke",
    ],
    inclusions: [
      "Full house accommodation",
      "All rooms included",
      "Air conditioning in all rooms",
      "Complete kitchen amenities",
      "Perfect for events and large groups",
    ],
    images: [
      "/images/full-house-1.jpeg",
      "/images/full-house-2.jpeg",
      "/images/full-house-3.jpeg",
      "/images/full-house-4.jpeg",
      "/images/full-house-5.jpeg",
    ],
    rates: [
      { guests: "Up to 10 pax", price: 7000 },
      { guests: "Up to 12 pax", price: 7500 },
      { guests: "15 to 20 pax", price: 8500 },
    ],
  },
];

export interface ActivityPackage {
  id: string;
  name: string;
  price: number;
  pax: string;
  activities: string[];
  images: string[];
}

export const activityPackages: ActivityPackage[] = [
  {
    id: "package-1",
    name: "Package 1",
    price: 2500,
    pax: "2-10 pax",
    activities: ["Snorkeling", "Kayraang Sandbar"],
    images: [
      "/images/package-1-1.jpeg",
      "/images/package-1-2.jpeg",
      "/images/package-1-3.jpeg",
      "/images/package-1-4.jpeg",
      "/images/package-1-5.jpeg",
      "/images/package-1-6.jpeg",
      "/images/package-1-7.jpeg",
    ],
  },
  {
    id: "package-2",
    name: "Package 2",
    price: 4500,
    pax: "2-10 pax",
    activities: ["Snorkeling", "Fish Feeding", "Cliff Jumping", "Kayraang"],
    images: [
      "/images/package-2-1.jpeg",
      "/images/package-2-2.jpeg",
      "/images/package-2-4.jpeg",
      "/images/package-2-5.jpeg",
      "/images/package-2-6.jpeg",
      "/images/package-2-7.jpeg",
      "/images/package-2-8.jpeg",
      "/images/package-2-9.jpeg",
      "/images/package-2-10.jpeg",
      "/images/package-2-11.jpeg",
    ],
  },
];

export interface Activity {
  id: string;
  name: string;
  price: number;
  duration: string;
  images: string[];
}

export const activities: Activity[] = [
  {
    id: "jetski",
    name: "Jetski",
    price: 3000,
    duration: "30 mins",
    images: [
      "/images/jetski-1.jpeg",
      "/images/jetski-2.jpeg",
      "/images/jetski-3.jpeg",
      "/images/jetski-4.jpeg",
    ],
  },
  {
    id: "kayaking",
    name: "Kayaking",
    price: 350,
    duration: "1 hour",
    images: [
      "/images/kayaking-1.jpeg",
      "/images/kayaking-2.jpeg",
      "/images/kayaking-3.jpeg",
    ],
  },
  {
    id: "banana-boat",
    name: "Banana Boat",
    price: 300,
    duration: "15 mins (per head)",
    images: [
      "/images/banana-boat-1.jpeg",
      "/images/banana-boat-2.jpeg",
      "/images/banana-boat-3.jpeg",
      "/images/banana-boat-4.jpeg",
      "/images/banana-boat-5.jpeg",
    ],
  },
];

export interface GalleryImage {
  id: number;
  src: string;
  alt: string;
}

export const galleryImages: GalleryImage[] = [
  { id: 1, src: "/images/gallery-1.jpeg", alt: "ZEN House Calayo" },
  { id: 2, src: "/images/gallery-2.jpeg", alt: "ZEN House Calayo" },
  { id: 3, src: "/images/gallery-3.jpeg", alt: "ZEN House Calayo" },
  { id: 4, src: "/images/gallery-4.jpeg", alt: "ZEN House Calayo" },
  { id: 5, src: "/images/gallery-5.jpeg", alt: "ZEN House Calayo" },
  { id: 6, src: "/images/gallery-6.jpeg", alt: "ZEN House Calayo" },
  { id: 7, src: "/images/gallery-7.jpeg", alt: "ZEN House Calayo" },
  { id: 8, src: "/images/gallery-8.jpeg", alt: "ZEN House Calayo" },
  { id: 9, src: "/images/gallery-9.jpeg", alt: "ZEN House Calayo" },
  { id: 10, src: "/images/gallery-10.jpeg", alt: "ZEN House Calayo" },
  { id: 11, src: "/images/gallery-11.jpeg", alt: "ZEN House Calayo" },
  { id: 12, src: "/images/gallery-12.jpeg", alt: "ZEN House Calayo" },
  { id: 13, src: "/images/gallery-13.jpeg", alt: "ZEN House Calayo" },
  { id: 14, src: "/images/gallery-14.jpeg", alt: "ZEN House Calayo" },
  { id: 15, src: "/images/gallery-15.jpeg", alt: "ZEN House Calayo" },
  { id: 16, src: "/images/gallery-16.jpeg", alt: "ZEN House Calayo" },
  { id: 17, src: "/images/gallery-17.jpeg", alt: "ZEN House Calayo" },
  { id: 18, src: "/images/gallery-18.jpeg", alt: "ZEN House Calayo" },
  { id: 19, src: "/images/gallery-19.jpeg", alt: "ZEN House Calayo" },
  { id: 20, src: "/images/gallery-20.jpeg", alt: "ZEN House Calayo" },
  { id: 21, src: "/images/gallery-21.jpeg", alt: "ZEN House Calayo" },
  { id: 22, src: "/images/gallery-22.jpeg", alt: "ZEN House Calayo" },
  { id: 23, src: "/images/gallery-23.jpeg", alt: "ZEN House Calayo" },
  { id: 24, src: "/images/gallery-24.jpeg", alt: "ZEN House Calayo" },
  { id: 25, src: "/images/gallery-25.jpeg", alt: "ZEN House Calayo" },
  { id: 26, src: "/images/gallery-26.jpeg", alt: "ZEN House Calayo" },
  { id: 27, src: "/images/gallery-27.jpeg", alt: "ZEN House Calayo" },
  { id: 28, src: "/images/gallery-28.jpeg", alt: "ZEN House Calayo" },
  { id: 29, src: "/images/gallery-29.jpeg", alt: "ZEN House Calayo" },
  { id: 30, src: "/images/gallery-30.jpeg", alt: "ZEN House Calayo" },
];
