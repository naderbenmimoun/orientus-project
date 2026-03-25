import axios from 'axios';
import type { Program, ProgramRequest, ProgramsResponse, ProgramFilters, AllProgramsResponse, FiltersResponse } from '../models/Program';

// Configuration de l'URL de base de l'API
const API_BASE_URL = 'http://localhost:8084/api';

// Clés pour le localStorage
const TOKEN_KEY = 'orientus_token';

// Configuration d'axios avec timeout et headers par défaut
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
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
 * Service pour la gestion des programmes d'études
 */
export const programService = {
  /**
   * 📋 Récupérer la liste des programmes avec filtres et pagination
   * @param page - Numéro de page (0-indexed)
   * @param size - Nombre d'éléments par page
   * @param filters - Filtres optionnels
   * @returns Promise<ProgramsResponse>
   */
  getPrograms: async (
    page: number = 0,
    size: number = 10,
    filters?: ProgramFilters
  ): Promise<ProgramsResponse> => {
    try {
      const params: Record<string, string | number> = { page, size };
      
      if (filters?.search) params.search = filters.search;
      if (filters?.country) params.country = filters.country;
      if (filters?.category) params.category = filters.category;
      if (filters?.degree) params.degree = filters.degree;
      if (filters?.language) params.language = filters.language;
      if (filters?.duration) params.duration = filters.duration;

      const response = await axiosInstance.get<ProgramsResponse>('/programs', { params });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch programs');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while fetching programs');
    }
  },

  /**
   * 🔍 Récupérer un programme par son ID
   * @param id - ID du programme
   * @returns Promise<Program>
   */
  getProgramById: async (id: number): Promise<Program> => {
    try {
      const response = await axiosInstance.get<Program>(`/programs/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 404) {
            throw new Error('Program not found');
          }
          throw new Error(error.response.data.message || 'Failed to fetch program');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while fetching program');
    }
  },

  /**
   * ➕ Créer un nouveau programme (ADMIN/OWNER only)
   * @param programData - Données du programme
   * @returns Promise<Program>
   */
  createProgram: async (programData: ProgramRequest): Promise<Program> => {
    try {
      const response = await axiosInstance.post<Program>('/programs', programData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 403) {
            throw new Error('Access denied. Only administrators can create programs.');
          }
          throw new Error(error.response.data.message || 'Failed to create program');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while creating program');
    }
  },

  /**
   * ✏️ Mettre à jour un programme (ADMIN/OWNER only)
   * @param id - ID du programme
   * @param programData - Données mises à jour
   * @returns Promise<Program>
   */
  updateProgram: async (id: number, programData: ProgramRequest): Promise<Program> => {
    try {
      const response = await axiosInstance.put<Program>(`/programs/${id}`, programData);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 403) {
            throw new Error('Access denied. Only administrators can update programs.');
          }
          if (error.response.status === 404) {
            throw new Error('Program not found');
          }
          throw new Error(error.response.data.message || 'Failed to update program');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while updating program');
    }
  },

  /**
   * 🗑️ Supprimer un programme (ADMIN/OWNER only)
   * @param id - ID du programme
   * @returns Promise<void>
   */
  deleteProgram: async (id: number): Promise<void> => {
    try {
      await axiosInstance.delete(`/programs/${id}`);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 403) {
            throw new Error('Access denied. Only administrators can delete programs.');
          }
          if (error.response.status === 404) {
            throw new Error('Program not found');
          }
          throw new Error(error.response.data.message || 'Failed to delete program');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while deleting program');
    }
  },

  /**
   * 📸 Convertir une image en base64
   * @param file - Fichier image
   * @returns Promise<string> - Image encodée en base64
   */
  convertImageToBase64: (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = () => {
        reject(new Error('Failed to convert image to base64'));
      };
    });
  },

  /**
   * 📋 Récupérer tous les pays uniques des programmes
   * @returns Promise<string[]>
   */
  getCountries: async (): Promise<string[]> => {
    try {
      // Get all programs and extract unique countries
      const response = await axiosInstance.get<ProgramsResponse>('/programs', {
        params: { page: 0, size: 1000 }
      });
      const countries = [...new Set(response.data.programs.map(p => p.country))].filter(Boolean).sort();
      return countries;
    } catch {
      return [];
    }
  },

  /**
   * 📋 Récupérer TOUS les programmes + filtres en 1 appel (mode "all")
   * Fallback : retourne null si le endpoint n'existe pas (404)
   */
  getAllPrograms: async (): Promise<AllProgramsResponse | null> => {
    try {
      const response = await axiosInstance.get<AllProgramsResponse>('/programs/all');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Endpoint pas encore déployé — on bascule en mode paginé
        return null;
      }
      throw error;
    }
  },

  /**
   * 📊 Récupérer uniquement les métadonnées de filtres + totalPrograms
   * Utilisé pour décider du mode hybride (all vs paginé)
   * Fallback : retourne null si le endpoint n'existe pas
   */
  getFiltersMetadata: async (): Promise<FiltersResponse | null> => {
    try {
      const response = await axiosInstance.get<FiltersResponse>('/programs/filters');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  },

  /**
   * 💓 Health check — réveiller le backend / keep-alive
   */
  healthCheck: async (): Promise<boolean> => {
    try {
      await axiosInstance.get('/health');
      return true;
    } catch {
      return false;
    }
  },
};

export default programService;
