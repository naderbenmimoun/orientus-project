package com.example.orientus.service;

import com.example.orientus.dto.RegisterRequest;
import com.example.orientus.dto.UpdateProfileRequest;
import com.example.orientus.entity.User;
import com.example.orientus.enums.UserRole;
import com.example.orientus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;

    // ═══════════════════════════════════════════════════════════════
    // 📝 MÉTHODES D'INSCRIPTION (DÉJÀ EXISTANTES)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Inscription publique → Toujours STUDENT
     */
    public User registerStudent(RegisterRequest request) {
        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Créer le nouvel utilisateur
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword()); // TODO: Hash avec BCrypt
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setNationality(request.getNationality());

        // ✅ FORCER le rôle STUDENT
        user.setRole(UserRole.STUDENT);

        user.setCreatedAt(LocalDateTime.now());

        // Sauvegarder en BDD
        return userRepository.save(user);
    }

    /**
     * Création d'admin → Seulement par un admin (on verra plus tard avec Spring Security)
     */
    public User createAdmin(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(request.getPassword());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPhone(request.getPhone());
        user.setNationality(request.getNationality());

        // ✅ Rôle ADMIN
        user.setRole(UserRole.ADMIN);

        user.setCreatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    /**
     * Trouver un utilisateur par email
     */
    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // ═══════════════════════════════════════════════════════════════
    // 🆕 NOUVELLES MÉTHODES POUR LE PROFIL
    // ═══════════════════════════════════════════════════════════════

    /**
     * Récupérer un utilisateur par son email (retourne Optional)
     * Utilisé pour récupérer le profil
     */
    public Optional<User> getUserByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    /**
     * Mettre à jour le profil d'un utilisateur
     * @param email Email de l'utilisateur à modifier
     * @param request Nouvelles données du profil
     * @return L'utilisateur modifié
     */
    public User updateProfile(String email, UpdateProfileRequest request) {
        // 1. Récupérer l'utilisateur
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // 2. Vérifier si le nouvel email existe déjà (si l'email a changé)
        if (!user.getEmail().equals(request.getEmail())) {
            if (userRepository.existsByEmail(request.getEmail())) {
                throw new RuntimeException("Email already exists");
            }
        }

        // 3. Mettre à jour les champs obligatoires
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        // 4. Mettre à jour les champs optionnels (seulement s'ils sont fournis)
        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone());
        }

        if (request.getNationality() != null && !request.getNationality().isBlank()) {
            user.setNationality(request.getNationality());
        }

        // 5. Mettre à jour le mot de passe seulement s'il est fourni
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(request.getPassword());
            // TODO: Hasher le mot de passe avec BCrypt (à faire plus tard)
        }

        // 6. Sauvegarder et retourner
        return userRepository.save(user);
    }

    /**
     * Supprimer un utilisateur par son email
     * @param email Email de l'utilisateur à supprimer
     */
    public void deleteUser(String email) {
        // Récupérer l'utilisateur
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Supprimer l'utilisateur
        userRepository.delete(user);
    }
}