export const ApplicationStatus = {
  NON_REPONDU: 'NON_REPONDU',
  EN_COURS: 'EN_COURS',
  CONTACTE: 'CONTACTE',
} as const;

export type ApplicationStatus = typeof ApplicationStatus[keyof typeof ApplicationStatus];

export const BudgetRange = {
  RANGE_0_10K: 'RANGE_0_10K',
  RANGE_10K_20K: 'RANGE_10K_20K',
  RANGE_20K_30K: 'RANGE_20K_30K',
  RANGE_30K_PLUS: 'RANGE_30K_PLUS',
} as const;

export type BudgetRange = typeof BudgetRange[keyof typeof BudgetRange];

export const BUDGET_LABELS: Record<string, string> = {
  RANGE_0_10K: '0€ - 10,000€',
  RANGE_10K_20K: '10,000€ - 20,000€',
  RANGE_20K_30K: '20,000€ - 30,000€',
  RANGE_30K_PLUS: 'Plus de 30,000€',
};

export const STATUS_LABELS: Record<string, string> = {
  NON_REPONDU: 'Non répondu',
  EN_COURS: 'En cours',
  CONTACTE: 'Contacté',
};

export interface Application {
  id: number;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
  };
  program: {
    id: number;
    title: string;
    university: string;
    country: string;
  };
  studentFirstName: string;
  studentLastName: string;
  studentEmail: string;
  studentPhone: string;
  studentNationality: string;
  budgetRange: BudgetRange;
  hasPassport: boolean;
  hasEnglishB2: boolean;
  hasFrenchB2: boolean;
  additionalNotes: string;
  status: ApplicationStatus;
  applicationDate: string;
  updatedAt: string;
}

export interface ApplicationRequest {
  budgetRange: BudgetRange;
  hasPassport: boolean;
  hasEnglishB2: boolean;
  hasFrenchB2: boolean;
  additionalNotes: string;
}

export interface ApplicationsResponse {
  applications: Application[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
}

export interface ApplicationStats {
  total: number;
  nonRepondu: number;
  enCours: number;
  contacte: number;
}
