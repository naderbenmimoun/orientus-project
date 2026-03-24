// Types pour le chatbot Orientus

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  messageId?: string;
  results?: ProgramResult[];
  stats?: SearchStats | null;
  needsClarification?: boolean;
  feedbackGiven?: boolean;
}

export interface ChatRequest {
  message: string;
  history?: { role: string; content: string }[];
}

export interface ProgramResult {
  title: string;
  university: string;
  degree: string;
  country: string;
  city: string;
  tuition: number | null;
  category: string;
  description: string | null;
  duration: string | null;
  language: string | null;
  image: string | null;
}

export interface SearchStats {
  totalResults: number;
  minTuition: number | null;
  maxTuition: number | null;
  availableDegrees: string[];
  availableCountries: string[];
}

export interface ChatbotResponse {
  messageId?: string;
  response: string;
  results: ProgramResult[];
  stats?: SearchStats | null;
  needsClarification?: boolean;
  inDomain?: boolean;
}

export interface WelcomeResponse {
  message: string;
  suggestions: string[];
}

export interface FeedbackRequest {
  messageId: string;
  rating: number;
  comment?: string;
}
