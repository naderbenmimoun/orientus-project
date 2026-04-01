// Student profile for ML recommendation
export interface StudentProfile {
  interestField: string;
  preferredCountry: string;
  preferredLanguage: string;
  targetDegree: string;
  currentDegree: string;
  gpa: number | null;
  languageLevel: string;
  ieltsScore: number | null;
  maxBudget: number;
  studyMode: string;
  needsScholarship: boolean;
}

// ML recommendation result
export interface ProgramScore {
  programId: number;
  title: string;
  matchScore: number;
  matchPercentage: number;
}

// API response
export interface RecommendationResponse {
  recommendations: ProgramScore[];
  totalRecommendations: number;
  mlAvailable: boolean;
}

// Full recommendation with program details
export interface RecommendationWithDetails extends ProgramScore {
  university?: string;
  country?: string;
  city?: string;
  degree?: string;
  category?: string;
  tuition?: number;
  language?: string;
  image?: string;
  universityLogo?: string;
  description?: string;
}

// Form field options
export const INTEREST_FIELDS = [
  { value: 'BUSINESS', label: 'Commerce & Business' },
  { value: 'ENGINEERING', label: 'Ingénierie' },
  { value: 'COMPUTER_SCIENCE', label: 'Informatique' },
  { value: 'ARTIFICIAL_INTELLIGENCE', label: 'Intelligence Artificielle' },
  { value: 'DATA_SCIENCE', label: 'Data Science' },
  { value: 'MEDICINE', label: 'Médecine' },
  { value: 'LAW', label: 'Droit' },
  { value: 'ARTS', label: 'Arts' },
  { value: 'DESIGN', label: 'Design' },
  { value: 'ARCHITECTURE', label: 'Architecture' },
  { value: 'EDUCATION', label: 'Éducation' },
  { value: 'PSYCHOLOGY', label: 'Psychologie' },
  { value: 'COMMUNICATION', label: 'Communication' },
  { value: 'MARKETING', label: 'Marketing' },
  { value: 'FINANCE', label: 'Finance' },
  { value: 'HOSPITALITY', label: 'Hôtellerie & Tourisme' },
  { value: 'OTHER', label: 'Autre' },
];

export const COUNTRIES = [
  { value: 'ANY', label: 'Peu importe' },
  { value: 'Latvia', label: 'Lettonie' },
  { value: 'France', label: 'France' },
  { value: 'Germany', label: 'Allemagne' },
  { value: 'Spain', label: 'Espagne' },
  { value: 'Turkey', label: 'Turquie' },
  { value: 'Italy', label: 'Italie' },
  { value: 'Netherlands', label: 'Pays-Bas' },
  { value: 'Poland', label: 'Pologne' },
];

export const LANGUAGES = [
  { value: 'ANY', label: 'Peu importe' },
  { value: 'English', label: 'Anglais' },
  { value: 'French', label: 'Français' },
  { value: 'German', label: 'Allemand' },
];

export const TARGET_DEGREES = [
  { value: 'BACHELOR', label: 'Licence (Bachelor)' },
  { value: 'MASTER', label: 'Master' },
  { value: 'MASTER_OF_ARTS', label: 'Master of Arts' },
  { value: 'MASTER_OF_SCIENCE', label: 'Master of Science' },
  { value: 'MBA', label: 'MBA' },
  { value: 'PHD', label: 'Doctorat (PhD)' },
  { value: 'DIPLOMA', label: 'Diplôme' },
  { value: 'CERTIFICATE', label: 'Certificat' },
];

export const CURRENT_DEGREES = [
  { value: 'HIGH_SCHOOL', label: 'Baccalauréat / Lycée' },
  { value: 'BACHELOR', label: 'Licence (Bachelor)' },
  { value: 'MASTER', label: 'Master' },
  { value: 'PHD', label: 'Doctorat (PhD)' },
];

export const LANGUAGE_LEVELS = [
  { value: 'A1', label: 'A1 - Débutant' },
  { value: 'A2', label: 'A2 - Élémentaire' },
  { value: 'B1', label: 'B1 - Intermédiaire' },
  { value: 'B2', label: 'B2 - Intermédiaire avancé' },
  { value: 'C1', label: 'C1 - Avancé' },
  { value: 'C2', label: 'C2 - Maîtrise' },
];

export const STUDY_MODES = [
  { value: 'ON_CAMPUS', label: 'Sur campus' },
  { value: 'BLENDED', label: 'Hybride' },
  { value: 'DISTANCE', label: 'À distance' },
];
