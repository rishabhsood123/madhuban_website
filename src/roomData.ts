export interface RoomDetail {
  id: string;
  name: string;
  tagline: string;
  price: number;
  priceFormatted: string;
  description: string;
  longDescription: string;
  guests: number;
  bedrooms: number;
  beds: string;
  bathrooms: string;
  features: { icon: string; label: string }[];
  images: string[];
  heroImage: string;
  extraBeds?: { count: number; pricePerBed: number; priceFormatted: string };
}

const BASE = import.meta.env.BASE_URL;

export const rooms: RoomDetail[] = [
  {
    id: 'orchard-room',
    name: 'Orchard Room',
    tagline: 'Wake up to the gentle rustle of apple trees',
    price: 8000,
    priceFormatted: '₹8,000',
    description:
      'Wake up to the gentle rustle of apple trees. Features a private sit-out surrounded by our lush orchard.',
    longDescription:
      'The Orchard Room is a warm, wood-panelled retreat on the ground floor of our A-frame cottage, offering direct access to a private sit-out area nestled among apple, plum, and apricot trees. Wake each morning to birdsong and dappled sunlight filtering through the orchard canopy. The room features handcrafted wooden furniture, a comfortable double bed with fresh linen, and large windows that frame the fruit trees and distant Himalayan peaks. Step outside onto your private sit-out with rattan chairs — the perfect spot for morning chai while watching the mist lift off the valley.',
    guests: 2,
    bedrooms: 1,
    beds: '1 double',
    bathrooms: '1 attached',
    features: [
      { icon: 'park', label: 'Private Sit-out' },
      { icon: 'deck', label: 'Orchard View' },
      { icon: 'bed', label: 'Double Bed' },
      { icon: 'shower', label: 'Attached Bathroom' },
      { icon: 'water_drop', label: 'Hot Water' },
      { icon: 'local_fire_department', label: 'Room Heater' },
      { icon: 'checkroom', label: 'Fresh Linen' },
      { icon: 'wifi', label: 'Wi-Fi' },
    ],
    images: [
      `${BASE}assets/rooms/orchard-room/IMG_1853.jpg`,
      `${BASE}assets/rooms/orchard-room/IMG_1861.jpg`,
      `${BASE}assets/rooms/orchard-room/IMG_1866.jpg`,
      `${BASE}assets/rooms/orchard-room/IMG_1872.jpg`,
      `${BASE}assets/rooms/orchard-room/IMG_1874.jpg`,
      `${BASE}assets/rooms/orchard-room/IMG_1877.jpg`,
      `${BASE}assets/rooms/orchard-room/IMG_1879.jpg`,
      `${BASE}assets/rooms/orchard-room/IMG_1883.jpg`,
      `${BASE}assets/rooms/orchard-room/IMG_1888.jpg`,
      `${BASE}assets/rooms/orchard-room/IMG_1889.jpg`,
      `${BASE}assets/rooms/orchard-room/IMG_1893.jpg`,
    ],
    heroImage: `${BASE}assets/rooms/orchard-room/IMG_1874.jpg`,
  },
  {
    id: 'valley-room',
    name: 'Valley Room',
    tagline: 'Sweeping views of the Fozal Valley',
    price: 8000,
    priceFormatted: '₹8,000',
    description:
      'Enjoy uninterrupted, sweeping views of the Fozal Valley and distant Himalayan peaks right from your bed.',
    longDescription:
      'The Valley Room is our most sought-after space, positioned on the upper floor to capture a breathtaking panorama of the Fozal Valley and the snow-capped Himalayan range. Floor-to-ceiling windows wrap around two walls, framing a living postcard that changes with every hour — golden sunrises, misty mornings, and star-filled nights. The room is furnished with a plush double bed, warm wooden interiors, and a cozy reading nook by the window. An attached modern bathroom completes the experience. This is the room for those who come to the mountains to simply gaze and breathe.',
    guests: 2,
    bedrooms: 1,
    beds: '1 double',
    bathrooms: '1 attached',
    features: [
      { icon: 'landscape', label: 'Valley Panorama' },
      { icon: 'wb_sunny', label: 'Sunrise View' },
      { icon: 'bed', label: 'Double Bed' },
      { icon: 'shower', label: 'Attached Bathroom' },
      { icon: 'water_drop', label: 'Hot Water' },
      { icon: 'local_fire_department', label: 'Room Heater' },
      { icon: 'chair', label: 'Reading Nook' },
      { icon: 'wifi', label: 'Wi-Fi' },
    ],
    images: [
      `${BASE}assets/rooms/valley-room/1.png`,
      `${BASE}assets/rooms/valley-room/2.png`,
      `${BASE}assets/rooms/valley-room/3.png`,
      `${BASE}assets/rooms/valley-room/4.png`,
      `${BASE}assets/rooms/valley-room/5.png`,
    ],
    heroImage: `${BASE}assets/valley_room.png`,
  },
  {
    id: 'attic-stay',
    name: 'Attic Stay',
    tagline: 'A cozy retreat under the A-frame roof',
    price: 12000,
    priceFormatted: '₹12,000',
    description:
      'A cozy, wood-paneled retreat under our A-frame roof. Perfect for stargazing and ultimate privacy.',
    longDescription:
      'The Attic Stay is our most charming and intimate space — a snug wood-panelled room tucked under the dramatic A-frame roof of our cottage. Exposed beams, warm string lights, and a skylight that opens up to the Himalayan night sky make this a favourite among solo travellers, writers, and couples seeking quiet seclusion. The sloped ceilings and compact layout give it a treehouse-like feel, while the comfortable bedding and warm rugs ensure a restful sleep. A shared bathroom is located just a few steps down. If you\'ve ever dreamt of falling asleep watching the stars, this is your room.',
    guests: 4,
    bedrooms: 1,
    beds: '2 double',
    bathrooms: '1 shared',
    extraBeds: { count: 2, pricePerBed: 2000, priceFormatted: '₹2,000' },
    features: [
      { icon: 'roofing', label: 'A-Frame Ceiling' },
      { icon: 'star', label: 'Skylight Window' },
      { icon: 'bed', label: 'Double Bed' },
      { icon: 'shower', label: 'Shared Bathroom' },
      { icon: 'water_drop', label: 'Hot Water' },
      { icon: 'local_fire_department', label: 'Room Heater' },
      { icon: 'edit', label: 'Writing Desk' },
      { icon: 'wifi', label: 'Wi-Fi' },
    ],
    images: [
      `${BASE}assets/rooms/attic-stay/1.png`,
      `${BASE}assets/rooms/attic-stay/2.png`,
      `${BASE}assets/rooms/attic-stay/3.png`,
      `${BASE}assets/rooms/attic-stay/4.png`,
      `${BASE}assets/rooms/attic-stay/5.png`,
    ],
    heroImage: `${BASE}assets/attic_stay.png`,
  },
];

export function getRoomById(id: string): RoomDetail | undefined {
  return rooms.find((r) => r.id === id);
}
