import axios from 'axios';
import type { RegisterRequest, AuthResponse } from '../models/User';

// Configuration de l'URL de base de l'API
const API_BASE_URL = 'http://localhost:8084/api/auth';

// Configuration d'axios avec timeout et headers par défaut
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Service d'authentification pour consommer l'API Spring Boot
 */
export const authService = {
  /**
   * Inscription d'un nouvel étudiant
   * @param registerData - Données d'inscription
   * @returns Promise<AuthResponse>
   */
  register: async (registerData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/register', registerData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        // Erreur de réponse du serveur
        if (error.response) {
          throw new Error(error.response.data.message || 'Registration failed');
        }
        // Erreur de réseau ou timeout
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      // Autre erreur
      throw new Error('An unexpected error occurred during registration');
    }
  },

  /**
   * Connexion d'un utilisateur (à implémenter plus tard)
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/login', {
        email,
        password,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Login failed');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred during login');
    }
  },
};

export default authService;
