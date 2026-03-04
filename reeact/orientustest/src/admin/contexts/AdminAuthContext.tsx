import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../../services/authService';

interface AdminUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

interface AdminAuthContextType {
  admin: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOwner: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

interface AdminAuthProviderProps {
  children: ReactNode;
}

/**
 * 🔐 Provider d'authentification Admin
 */
export const AdminAuthProvider = ({ children }: AdminAuthProviderProps) => {
  const [admin, setAdmin] = useState<AdminUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 Charger l'admin depuis le localStorage au démarrage
  useEffect(() => {
    const loadAdmin = () => {
      const currentUser = authService.getCurrentUser();
      const role = currentUser?.role?.toUpperCase();
      if (currentUser && (role === 'OWNER' || role === 'ADMIN')) {
        setAdmin({
          id: currentUser.id!,
          email: currentUser.email!,
          firstName: currentUser.firstName!,
          lastName: currentUser.lastName!,
          role: currentUser.role!,
        });
      }
      setIsLoading(false);
    };

    loadAdmin();
  }, []);

  /**
   * 🔑 Fonction de connexion Admin
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await authService.login(email, password);
      const role = response.role?.toUpperCase();

      // Vérifier si l'utilisateur est OWNER ou ADMIN
      if (role !== 'OWNER' && role !== 'ADMIN') {
        authService.logout(); // Nettoyer le token
        throw new Error('Access denied. Only administrators can access this area.');
      }

      if (response.token) {
        setAdmin({
          id: response.id!,
          email: response.email!,
          firstName: response.firstName!,
          lastName: response.lastName!,
          role: response.role!,
        });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      throw error;
    }
  };

  /**
   * 🚪 Fonction de déconnexion
   */
  const logout = () => {
    authService.logout();
    setAdmin(null);
  };

  const value: AdminAuthContextType = {
    admin,
    isAuthenticated: !!admin,
    isLoading,
    isOwner: admin?.role?.toUpperCase() === 'OWNER',
    isAdmin: admin?.role?.toUpperCase() === 'ADMIN',
    login,
    logout,
  };

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
};

/**
 * 🪝 Hook personnalisé pour utiliser le contexte d'authentification Admin
 */
export const useAdminAuth = (): AdminAuthContextType => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};
