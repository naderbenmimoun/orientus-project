const API_URL = 'http://localhost:8084/api/chatbot';

export interface ProgramResult {
  id: number;
  university: string;
  country: string;
  program: string;
  level: string;
  tuition: string;
  intake: string;
  language: string;
  city: string;
  duration: string;
  websiteUrl: string;
}

export interface AppliedCriteria {
  country: string | null;
  studyLevel: string | null;
  programKeywords: string[];
  maxBudget: number | null;
}

export interface ChatbotResponse {
  inDomain: boolean;
  message: string;
  results: ProgramResult[];
  appliedCriteria: AppliedCriteria;
}

export const chatbotService = {
  async ask(question: string): Promise<ChatbotResponse> {
    try {
      const response = await fetch(`${API_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatbotResponse = await response.json();
      return data;
    } catch (error) {
      console.error('Error calling chatbot API:', error);
      throw error;
    }
  },
};
