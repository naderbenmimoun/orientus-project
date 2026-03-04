import axios from 'axios';

// Configuration de l'URL de base de l'API
const API_BASE_URL = 'http://localhost:8084/api';

// Clés pour le localStorage
const TOKEN_KEY = 'orientus_token';

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
 * Interface pour un Admin
 */
export interface Admin {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  nationality?: string;
  role: string;
  createdAt?: string;
}

/**
 * Interface pour créer un Admin
 */
export interface CreateAdminRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  nationality?: string;
}

/**
 * Interface pour la réponse du profil
 */
export interface AdminProfileResponse {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  nationality?: string;
  role: string;
  createdAt?: string;
}

/**
 * Service pour les opérations Admin
 */
export const adminService = {
  /**
   * 📋 Récupérer la liste des admins (OWNER only)
   * @param ownerEmail - Email du OWNER
   * @returns Promise<Admin[]>
   */
  getAdminList: async (ownerEmail: string): Promise<Admin[]> => {
    try {
      const response = await axiosInstance.get<Admin[]>('/admin/list', {
        params: { ownerEmail },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch admin list');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while fetching admin list');
    }
  },

  /**
   * ➕ Créer un nouvel admin (OWNER only)
   * @param ownerEmail - Email du OWNER
   * @param adminData - Données du nouvel admin
   * @returns Promise<Admin>
   */
  createAdmin: async (ownerEmail: string, adminData: CreateAdminRequest): Promise<Admin> => {
    try {
      const response = await axiosInstance.post<Admin>('/admin/create', adminData, {
        params: { ownerEmail },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to create admin');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while creating admin');
    }
  },

  /**
   * 🗑️ Supprimer un admin (OWNER only)
   * @param adminId - ID de l'admin à supprimer
   * @param ownerEmail - Email du OWNER
   * @returns Promise<{ message: string }>
   */
  deleteAdmin: async (adminId: number, ownerEmail: string): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.delete<{ message: string }>(`/admin/${adminId}`, {
        params: { ownerEmail },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to delete admin');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while deleting admin');
    }
  },

  /**
   * 👤 Récupérer le profil d'un admin
   * @param email - Email de l'admin
   * @returns Promise<AdminProfileResponse>
   */
  getAdminProfile: async (email: string): Promise<AdminProfileResponse> => {
    try {
      const response = await axiosInstance.get<AdminProfileResponse>(`/users/profile?email=${encodeURIComponent(email)}`, {
        headers: {
          'Content-Type': undefined,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch profile');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while fetching profile');
    }
  },
};

export default adminService;
