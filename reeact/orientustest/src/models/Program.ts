// Program degree types
export const DegreeType = {
  BACHELOR: 'BACHELOR',
  MASTER: 'MASTER',
  MASTER_OF_ARTS: 'MASTER_OF_ARTS',
  MASTER_OF_SCIENCE: 'MASTER_OF_SCIENCE',
  MBA: 'MBA',
  PHD: 'PHD',
  DIPLOMA: 'DIPLOMA',
  CERTIFICATE: 'CERTIFICATE'
} as const;

export type DegreeTypeValue = typeof DegreeType[keyof typeof DegreeType];

// Program category types
export const CategoryType = {
  BUSINESS: 'BUSINESS',
  ENGINEERING: 'ENGINEERING',
  COMPUTER_SCIENCE: 'COMPUTER_SCIENCE',
  ARTIFICIAL_INTELLIGENCE: 'ARTIFICIAL_INTELLIGENCE',
  DATA_SCIENCE: 'DATA_SCIENCE',
  MEDICINE: 'MEDICINE',
  LAW: 'LAW',
  ARTS: 'ARTS',
  DESIGN: 'DESIGN',
  ARCHITECTURE: 'ARCHITECTURE',
  EDUCATION: 'EDUCATION',
  PSYCHOLOGY: 'PSYCHOLOGY',
  COMMUNICATION: 'COMMUNICATION',
  MARKETING: 'MARKETING',
  FINANCE: 'FINANCE',
  HOSPITALITY: 'HOSPITALITY',
  OTHER: 'OTHER'
} as const;

export type CategoryTypeValue = typeof CategoryType[keyof typeof CategoryType];

// Program model
export interface Program {
  id: number;
  title: string;
  university: string;
  country: string;
  city: string;
  degree: DegreeTypeValue | string;
  category: CategoryTypeValue | string;
  duration: string;
  language: string;
  tuition: number;
  description: string;
  image: string;
  universityLogo: string;
  featured: boolean;
  createdAt: string;
  // ML fields
  studyMode?: string;
  minGpa?: number | null;
  minLanguageLevel?: string;
  minIelts?: number | null;
  minToefl?: number | null;
  scholarshipAvailable?: boolean;
}

// Create/Update program request
export interface ProgramRequest {
  title: string;
  university: string;
  country: string;
  city: string;
  degree: string;
  category: string;
  duration: string;
  language: string;
  tuition: number;
  description: string;
  image: string;
  universityLogo: string;
  featured: boolean;
  // ML fields
  studyMode: string;
  minGpa: number | null;
  minLanguageLevel: string;
  minIelts: number | null;
  minToefl: number | null;
  scholarshipAvailable: boolean;
}

// Programs list response from API (paginé)
export interface ProgramsResponse {
  programs: Program[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

// Réponse de GET /api/programs/all (tout d'un coup)
export interface AllProgramsResponse {
  programs: Program[];
  filters: FiltersMetadata;
  totalPrograms: number;
}

// Metadata des filtres disponibles
export interface FiltersMetadata {
  countries: string[];
  categories: string[];
  degrees: string[];
  languages: string[];
}

// Réponse de GET /api/programs/filters (metadata seule)
export interface FiltersResponse extends FiltersMetadata {
  totalPrograms: number;
}

// Compteurs par valeur de filtre
export interface FilterCounts {
  byCountry: Record<string, number>;
  byDegree: Record<string, number>;
  byCategory: Record<string, number>;
  byLanguage: Record<string, number>;
}

// Options de tri
export type SortOption = 'recommended' | 'newest' | 'titleAsc' | 'titleDesc' | 'tuitionAsc' | 'tuitionDesc';

// Program filters
export interface ProgramFilters {
  search?: string;
  country?: string;
  category?: string;
  degree?: string;
  language?: string;
  duration?: string;
}

// Labels for display
export const DEGREE_LABELS: Record<string, string> = {
  BACHELOR: 'Licence (Bachelor)',
  MASTER: 'Master',
  MASTER_OF_ARTS: 'Master of Arts',
  MASTER_OF_SCIENCE: 'Master of Science',
  MBA: 'MBA',
  PHD: 'Doctorat (PhD)',
  DIPLOMA: 'Diplôme',
  CERTIFICATE: 'Certificat'
};

export const CATEGORY_LABELS: Record<string, string> = {
  BUSINESS: 'Commerce & Business',
  ENGINEERING: 'Ingénierie',
  COMPUTER_SCIENCE: 'Informatique',
  ARTIFICIAL_INTELLIGENCE: 'Intelligence Artificielle',
  DATA_SCIENCE: 'Data Science',
  MEDICINE: 'Médecine & Santé',
  LAW: 'Droit',
  ARTS: 'Arts',
  DESIGN: 'Design',
  ARCHITECTURE: 'Architecture',
  EDUCATION: 'Éducation',
  PSYCHOLOGY: 'Psychologie',
  COMMUNICATION: 'Communication',
  MARKETING: 'Marketing',
  FINANCE: 'Finance',
  HOSPITALITY: 'Hôtellerie & Tourisme',
  OTHER: 'Autre'
};

export const LANGUAGE_OPTIONS = [
  'Anglais',
  'Français',
  'Allemand',
  'Espagnol',
  'Italien',
  'Arabe',
  'Autre'
];

export const DURATION_OPTIONS = [
  '1 semestre',
  '2 semestres',
  '1 an',
  '2 ans',
  '3 ans',
  '4 ans',
  '5 ans',
  '6 ans'
];

export const STUDY_MODE_OPTIONS = [
  { value: 'ON_CAMPUS', label: 'Sur campus' },
  { value: 'BLENDED', label: 'Hybride' },
  { value: 'DISTANCE', label: 'À distance' },
];

export const LANGUAGE_LEVEL_OPTIONS = [
  { value: '', label: 'Non requis' },
  { value: 'A1', label: 'A1 - Débutant' },
  { value: 'A2', label: 'A2 - Élémentaire' },
  { value: 'B1', label: 'B1 - Intermédiaire' },
  { value: 'B2', label: 'B2 - Intermédiaire avancé' },
  { value: 'C1', label: 'C1 - Avancé' },
  { value: 'C2', label: 'C2 - Maîtrise' },
];
