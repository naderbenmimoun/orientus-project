import axios from 'axios';
import type { StudentProfile, RecommendationResponse } from '../models/Recommendation';
import type { Program } from '../models/Program';

const API_BASE_URL = 'http://localhost:8084/api';
const TOKEN_KEY = 'orientus_token';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const recommendationService = {
  getRecommendations: async (profile: StudentProfile): Promise<RecommendationResponse> => {
    const response = await axiosInstance.post<RecommendationResponse>('/recommendations', profile);
    return response.data;
  },

  checkHealth: async (): Promise<{ mlAvailable: boolean }> => {
    try {
      const response = await axiosInstance.get('/recommendations/health');
      return response.data;
    } catch {
      return { mlAvailable: false };
    }
  },

  getProgramDetails: async (programId: number): Promise<Program> => {
    const response = await axiosInstance.get<Program>(`/programs/${programId}`);
    return response.data;
  },
};
