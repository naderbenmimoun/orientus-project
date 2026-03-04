import axios from 'axios';
import type { RegisterRequest, AuthResponse, User } from '../models/User';

// Configuration de l'URL de base de l'API
const API_BASE_URL = 'http://localhost:8084/api/auth';

// Clés pour le localStorage
const TOKEN_KEY = 'orientus_token';
const USER_KEY = 'orientus_user';

// Configuration d'axios avec timeout et headers par défaut
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 🔐 Intercepteur pour ajouter automatiquement le token JWT à chaque requête
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Service d'authentification pour consommer l'API Spring Boot
 */
export const authService = {
  /**
   * 🔑 Connexion d'un utilisateur
   * @param email - Email de l'utilisateur
   * @param password - Mot de passe
   * @returns Promise<AuthResponse>
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/login', {
        email,
        password,
      });

      // ✅ Sauvegarder le token et les infos utilisateur
      if (response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify({
          id: response.data.id,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
        }));
      }

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

  /**
   * 📝 Inscription d'un nouvel étudiant
   * @param registerData - Données d'inscription
   * @returns Promise<AuthResponse>
   */
  register: async (registerData: RegisterRequest): Promise<AuthResponse> => {
    try {
      const response = await axiosInstance.post<AuthResponse>('/register', registerData);
      
      // ✅ Sauvegarder le token et les infos utilisateur si l'inscription retourne un token
      if (response.data.token) {
        localStorage.setItem(TOKEN_KEY, response.data.token);
        localStorage.setItem(USER_KEY, JSON.stringify({
          id: response.data.id,
          email: response.data.email,
          firstName: response.data.firstName,
          lastName: response.data.lastName,
          role: response.data.role,
        }));
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Registration failed');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred during registration');
    }
  },

  /**
   * 🚪 Déconnexion de l'utilisateur
   */
  logout: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * 🎫 Récupérer le token JWT stocké
   * @returns string | null
   */
  getToken: (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * 👤 Récupérer les informations de l'utilisateur connecté
   * @returns User | null
   */
  getCurrentUser: (): Partial<User> | null => {
    const userStr = localStorage.getItem(USER_KEY);
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  },

  /**
   * ✅ Vérifier si l'utilisateur est connecté
   * @returns boolean
   */
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(TOKEN_KEY);
  },
};

export default authService;
