# 🔐 Guide d'Authentification - Orientus

## ✅ Configuration Complétée

L'authentification entre le backend Spring Boot et le frontend React est maintenant complètement configurée et fonctionnelle !

---

## 📁 Fichiers Créés/Modifiés

### 1. **Models** (`src/models/User.ts`)
- ✅ `AuthResponse` mis à jour avec le token JWT
- Structure alignée avec le backend Spring Boot

### 2. **Services** (`src/services/authService.ts`)
- ✅ `login()` - Connexion utilisateur avec JWT
- ✅ `register()` - Inscription utilisateur
- ✅ `logout()` - Déconnexion
- ✅ `getToken()` - Récupérer le token stocké
- ✅ `getCurrentUser()` - Récupérer l'utilisateur connecté
- ✅ `isAuthenticated()` - Vérifier l'état de connexion
- ✅ Intercepteur Axios pour ajouter automatiquement le token JWT

### 3. **Context** (`src/contexts/AuthContext.tsx`) ⭐ NOUVEAU
- Provider global pour gérer l'état d'authentification
- Hook `useAuth()` pour accéder à l'authentification dans n'importe quel composant

### 4. **Pages**
- ✅ `LoginPage.tsx` - Connectée au backend réel
- ✅ Gestion des erreurs d'authentification
- ✅ Redirection après connexion réussie

### 5. **Components**
- ✅ `Navbar.tsx` - Affichage dynamique Login/SignUp ou menu utilisateur
- ✅ Menu dropdown avec infos utilisateur et logout

### 6. **App** (`src/App.tsx`)
- ✅ Wrappé avec `<AuthProvider>` pour l'accès global

---

## 🚀 Comment Utiliser

### 1. Démarrer le Backend Spring Boot
```bash
# Assure-toi que ton backend tourne sur port 8084
# L'endpoint doit être : http://localhost:8084/api/auth/login
```

### 2. Démarrer le Frontend React
```bash
npm run dev
# Doit tourner sur http://localhost:5173
```

### 3. Tester la Connexion
1. Va sur http://localhost:5173/login
2. Entre les identifiants d'un utilisateur existant
3. Clique sur "Sign In"
4. Si succès → Redirection vers la page d'accueil avec le nom de l'utilisateur affiché dans la navbar

---

## 🔑 Utiliser `useAuth` dans N'importe Quel Composant

```tsx
import { useAuth } from '../contexts/AuthContext';

function MonComposant() {
  const { user, isAuthenticated, logout } = useAuth();

  if (isAuthenticated) {
    return (
      <div>
        <p>Bienvenue {user?.firstName} {user?.lastName}</p>
        <p>Rôle: {user?.role}</p>
        <button onClick={logout}>Se déconnecter</button>
      </div>
    );
  }

  return <p>Vous n'êtes pas connecté</p>;
}
```

---

## 🛡️ Protéger des Routes (Optionnel - À Implémenter)

Si tu veux créer des pages accessibles seulement aux utilisateurs connectés :

### Créer `src/components/ProtectedRoute.tsx` :

```tsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```

### Utiliser dans `App.tsx` :

```tsx
import { ProtectedRoute } from './components/ProtectedRoute';

// Dans <Routes>
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />
```

---

## 📦 Stockage des Données

Les données d'authentification sont stockées dans le **localStorage** du navigateur :

- **Token JWT** : `orientus_token`
- **User Info** : `orientus_user`

Ces données sont automatiquement :
- ✅ Sauvegardées lors du login/register
- ✅ Chargées au démarrage de l'app
- ✅ Supprimées lors du logout

---

## 🔄 Flux d'Authentification

### Login :
1. Utilisateur entre email + password
2. `LoginPage` appelle `login()` du contexte
3. `AuthContext` appelle `authService.login()`
4. `authService` envoie POST à `/api/auth/login`
5. Backend renvoie JWT + user info
6. Token et user sauvegardés dans localStorage
7. État global mis à jour via `AuthContext`
8. Redirection vers la page d'accueil
9. Navbar affiche le menu utilisateur

### Logout :
1. Clic sur "Logout" dans le menu
2. `logout()` du contexte est appelé
3. `authService.logout()` supprime token et user du localStorage
4. État global réinitialisé
5. Navbar affiche Login/SignUp

---

## 🔐 Sécurité

- ✅ **Token JWT** ajouté automatiquement à chaque requête via l'intercepteur Axios
- ✅ **CORS** configuré côté backend pour `http://localhost:5173`
- ✅ **Validation** des formulaires côté frontend
- ✅ **Gestion d'erreurs** pour afficher des messages clairs à l'utilisateur

---

## 🧪 Test de la Connexion

### Créer un utilisateur de test (via ton backend) :

```sql
INSERT INTO users (email, password, first_name, last_name, nationality, role, created_at) 
VALUES ('test@orientus.com', '$2a$10$...', 'John', 'Doe', 'FR', 'STUDENT', NOW());
```

Utilise un password hashé avec BCrypt !

---

## 🎯 Prochaines Étapes (Optionnelles)

1. ✅ **Connecter RegisterPage** (pareil que LoginPage)
2. ✅ **Créer ProtectedRoute** pour les pages privées
3. ✅ **Ajouter "Forgot Password"**
4. ✅ **Refresh Token** pour renouveler automatiquement le JWT
5. ✅ **Menu Mobile** avec auth dans Navbar
6. ✅ **Dashboard** étudiant/admin selon le rôle

---

## ❓ Problèmes Courants

### Backend non accessible
- Vérifie que Spring Boot tourne sur `localhost:8084`
- Vérifie la config CORS dans `SecurityConfig.java`

### Token non envoyé
- L'intercepteur Axios ajoute automatiquement le token
- Vérifie dans DevTools > Network > Headers : `Authorization: Bearer xxx`

### Utilisateur non persisté après refresh
- Normal si tu supprimes localStorage
- L'app recharge automatiquement depuis localStorage au démarrage

---

## 📞 Support

Pour toute question sur l'authentification, vérifie :
1. Console du navigateur (F12)
2. Network tab pour voir les requêtes
3. Console Spring Boot pour les logs backend

Tout est prêt ! 🎉
