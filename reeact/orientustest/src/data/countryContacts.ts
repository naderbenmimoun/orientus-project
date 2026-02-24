// Country contact information data structure
// TO ADD NEW COUNTRIES: Simply add a new object to the array below with the same structure

export interface CountryContact {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  workingHours: string;
  website?: string;
  facebook?: string;
  instagram?: string;
  coordinates: { lat: number; lng: number; x?: number; y?: number }; // lat/lng for Google Maps, x/y for SVG fallback
}

export const countryContacts: CountryContact[] = [
  {
    id: 'armenia',
    name: 'Armenia',
    city: 'Yerevan',
    address: 'Yerevan, Armenia', // Will be updated with actual address
    phone: '+374 XX XXX XXX', // Will be updated
    email: 'armenia@orientus.com',
    workingHours: 'Mon-Fri: 9:00 AM - 6:00 PM (GMT+4)',
    website: 'https://orientus.com',
    facebook: 'https://www.facebook.com/profile.php?id=61583112839104',
    instagram: 'https://www.instagram.com/orientus_armenia/',
    coordinates: { lat: 40.1792, lng: 44.4991 },
  },
  {
    id: 'egypt',
    name: 'Egypt',
    city: 'Cairo',
    address: 'Cairo, Egypt', // Will be updated with actual address
    phone: '+20 2 XXXX XXXX',
    email: 'egypt@orientus.com',
    workingHours: 'Sun-Thu: 9:00 AM - 5:00 PM (GMT+2)',
    website: 'https://orientus.com',
    facebook: 'https://www.facebook.com/profile.php?id=61582843417579',
    instagram: 'https://www.instagram.com/orientus_egypt/',
    coordinates: { lat: 30.0444, lng: 31.2357 },
  },
  {
    id: 'morocco',
    name: 'Morocco',
    city: 'Casablanca',
    address: 'Casablanca, Morocco', // Will be updated with actual address
    phone: '+212 5XX XXX XXX',
    email: 'morocco@orientus.com',
    workingHours: 'Mon-Fri: 9:00 AM - 6:00 PM (GMT)',
    website: 'https://orientus.com',
    facebook: 'https://www.facebook.com/profile.php?id=61583422796256',
    instagram: 'https://www.instagram.com/orientus_morocco/',
    coordinates: { lat: 33.5731, lng: -7.5898 },
  },
  {
    id: 'uzbekistan',
    name: 'Uzbekistan',
    city: 'Tashkent',
    address: 'Tashkent, Uzbekistan', // Will be updated with actual address
    phone: '+998 XX XXX XXXX',
    email: 'uzbekistan@orientus.com',
    workingHours: 'Mon-Fri: 9:00 AM - 6:00 PM (GMT+5)',
    website: 'https://orientus.com',
    facebook: 'https://www.facebook.com/profile.php?id=61582060033505',
    instagram: 'https://www.instagram.com/orientus_uzbekistan/',
    coordinates: { lat: 41.2995, lng: 69.2401 },
  },
  {
    id: 'turkey',
    name: 'Turkey',
    city: 'Istanbul',
    address: 'Istanbul, Turkey', // Will be updated with actual address
    phone: '+90 XXX XXX XXXX',
    email: 'turkey@orientus.com',
    workingHours: 'Mon-Fri: 9:00 AM - 6:00 PM (GMT+3)',
    website: 'https://orientus.com',
    facebook: 'https://www.facebook.com/profile.php?id=61588277251041',
    instagram: 'https://www.instagram.com/orientus_turkey/',
    coordinates: { lat: 41.0082, lng: 28.9784 },
  },
  {
    id: 'hostus',
    name: 'Hostus',
    city: 'International',
    address: 'Hostus Office', // Will be updated with actual address
    phone: '+XXX XX XXX XXXX',
    email: 'contact@hostus.com',
    workingHours: '24/7 Support Available',
    website: 'https://hostus.com',
    facebook: 'https://www.facebook.com/profile.php?id=61586734031498',
    instagram: 'https://www.instagram.com/hostus1.0/',
    coordinates: { lat: 36, lng: 10 }, // Will be updated with actual location
  },
];

// Default global contact (shown before selecting any location)
export const defaultContact: CountryContact = {
  id: 'global',
  name: 'Orientus Global',
  city: 'Headquarters',
  address: 'Select a location on the map to see contact details',
  phone: '+1 800 ORIENTUS',
  email: 'contact@orientus.com',
  workingHours: '24/7 Support Available',
  website: 'https://orientus.com',
  coordinates: { lat: 36, lng: 35 },
};
