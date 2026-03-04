import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../models/User';
import { authService } from '../services/authService';

interface AuthContextType {
  user: Partial<User> | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * 🔐 Provider d'authentification pour gérer l'état global de connexion
 */
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<Partial<User> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 🚀 Charger l'utilisateur depuis le localStorage au démarrage
  useEffect(() => {
    const loadUser = () => {
      const currentUser = authService.getCurrentUser();
      setUser(currentUser);
      setIsLoading(false);
    };

    loadUser();
  }, []);

  /**
   * 🔑 Fonction de connexion
   */
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const response = await authService.login(email, password);
      
      // Mettre à jour l'état avec les infos de l'utilisateur
      if (response.token) {
        setUser({
          id: response.id!,
          email: response.email!,
          firstName: response.firstName!,
          lastName: response.lastName!,
          role: response.role! as any,
        });
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (error) {
      throw error; // Propager l'erreur au composant appelant
    }
  };

  /**
   * 🚪 Fonction de déconnexion
   */
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * 🪝 Hook personnalisé pour utiliser le contexte d'authentification
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
