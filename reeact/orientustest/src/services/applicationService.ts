import axios from 'axios';
import type { Application, ApplicationRequest, ApplicationsResponse, ApplicationStats } from '../models/Application';
import type { ApplicationStatus } from '../models/Application';

const API_BASE_URL = 'http://localhost:8084/api/applications';
const TOKEN_KEY = 'orientus_token';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

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

// Normalize paginated response from Spring Boot (content/totalElements) or custom (applications/totalItems)
function normalizeApplicationsResponse(data: Record<string, unknown>): ApplicationsResponse {
  return {
    applications: (data.applications ?? data.content ?? []) as Application[],
    currentPage: (data.currentPage ?? data.number ?? 0) as number,
    totalItems: (data.totalItems ?? data.totalElements ?? 0) as number,
    totalPages: (data.totalPages ?? 0) as number,
  };
}

export const applicationService = {
  /**
   * Submit a new application
   */
  createApplication: async (
    studentId: number,
    programId: number,
    data: ApplicationRequest
  ): Promise<{ message: string; application: Application }> => {
    try {
      const response = await axiosInstance.post('', data, {
        params: { studentId, programId },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to submit application');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while submitting application');
    }
  },

  /**
   * Get all applications with pagination and optional status filter
   */
  getApplications: async (
    page: number = 0,
    size: number = 10,
    status?: ApplicationStatus
  ): Promise<ApplicationsResponse> => {
    try {
      const params: Record<string, string | number> = { page, size };
      if (status) params.status = status;

      const response = await axiosInstance.get('', { params });
      return normalizeApplicationsResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch applications');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while fetching applications');
    }
  },

  /**
   * Get applications for a specific student
   */
  getStudentApplications: async (studentId: number): Promise<ApplicationsResponse> => {
    try {
      const response = await axiosInstance.get(`/student/${studentId}`);
      return normalizeApplicationsResponse(response.data);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch your applications');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while fetching your applications');
    }
  },

  /**
   * Get a single application by ID
   */
  getApplicationById: async (id: number): Promise<Application> => {
    try {
      const response = await axiosInstance.get<Application>(`/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 404) {
            throw new Error('Application not found');
          }
          throw new Error(error.response.data.message || 'Failed to fetch application');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while fetching application');
    }
  },

  /**
   * Update application status
   */
  updateApplicationStatus: async (
    id: number,
    status: ApplicationStatus
  ): Promise<{ message: string; application: Application }> => {
    try {
      const response = await axiosInstance.put(`/${id}/status`, null, {
        params: { status },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to update application status');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while updating application status');
    }
  },

  /**
   * Delete an application
   */
  deleteApplication: async (id: number): Promise<{ message: string }> => {
    try {
      const response = await axiosInstance.delete(`/${id}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          if (error.response.status === 404) {
            throw new Error('Application not found');
          }
          throw new Error(error.response.data.message || 'Failed to delete application');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while deleting application');
    }
  },

  /**
   * Get application statistics
   */
  getStats: async (): Promise<ApplicationStats> => {
    try {
      const response = await axiosInstance.get<ApplicationStats>('/stats');
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response) {
          throw new Error(error.response.data.message || 'Failed to fetch statistics');
        }
        if (error.request) {
          throw new Error('Unable to reach the server. Please check your connection.');
        }
      }
      throw new Error('An unexpected error occurred while fetching statistics');
    }
  },
};

export default applicationService;
