package com.example.orientus.service;

import com.example.orientus.dto.RegisterRequest;
import com.example.orientus.dto.UpdateProfileRequest;
import com.example.orientus.entity.User;
import com.example.orientus.enums.UserRole;
import com.example.orientus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class UserService {

    private final UserRepository userRepository;
    private final EmailService emailService;

    private static final int CODE_EXPIRATION_MINUTES = 15;

    // ═══════════════════════════════════════════════════════════════
    // 📝 MÉTHODES D'INSCRIPTION
    // ═══════════════════════════════════════════════════════════════

    /**
     * Inscription publique → Toujours STUDENT
     * Génère un code de vérification et envoie un email
     */
    public User registerStudent(RegisterRequest request) {
        // Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // Générer un code de vérification à 6 chiffres
        String verificationCode = generateVerificationCode();

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

        // ✅ Vérification email
        user.setVerified(false);
        user.setVerificationCode(verificationCode);
        user.setCodeExpirationTime(LocalDateTime.now().plusMinutes(CODE_EXPIRATION_MINUTES));

        // Sauvegarder en BDD
        User savedUser = userRepository.save(user);

        // ✉️ Envoyer l'email de vérification (non-bloquant)
        try {
            emailService.sendVerificationEmail(user.getEmail(), verificationCode);
            log.info("📧 Code de vérification envoyé à : {}", user.getEmail());
        } catch (Exception e) {
            log.warn("⚠️ Email non envoyé à {} — l'utilisateur pourra renvoyer le code via /resend-code. Erreur: {}", user.getEmail(), e.getMessage());
        }

        return savedUser;
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

    // ═══════════════════════════════════════════════════════════════
    // 📧 MÉTHODES DE VÉRIFICATION EMAIL
    // ═══════════════════════════════════════════════════════════════

    /**
     * Vérifier l'email d'un utilisateur avec le code reçu
     * @param email Email de l'utilisateur
     * @param code Code de vérification à 6 chiffres
     */
    public void verifyEmail(String email, String code) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Vérifier si déjà vérifié
        if (user.isVerified()) {
            throw new RuntimeException("Email is already verified");
        }

        // Vérifier si le code a expiré
        if (user.getCodeExpirationTime() == null || LocalDateTime.now().isAfter(user.getCodeExpirationTime())) {
            throw new RuntimeException("Verification code has expired. Please request a new one.");
        }

        // Vérifier si le code est correct
        if (!code.equals(user.getVerificationCode())) {
            throw new RuntimeException("Invalid verification code");
        }

        // ✅ Marquer comme vérifié
        user.setVerified(true);
        user.setVerificationCode(null);  // Supprimer le code après vérification
        user.setCodeExpirationTime(null);
        userRepository.save(user);

        log.info("✅ Email vérifié pour : {}", email);
    }

    /**
     * Renvoyer un nouveau code de vérification
     * @param email Email de l'utilisateur
     */
    public void resendVerificationCode(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Vérifier si déjà vérifié
        if (user.isVerified()) {
            throw new RuntimeException("Email is already verified");
        }

        // Générer un nouveau code
        String newCode = generateVerificationCode();
        user.setVerificationCode(newCode);
        user.setCodeExpirationTime(LocalDateTime.now().plusMinutes(CODE_EXPIRATION_MINUTES));
        userRepository.save(user);

        // Envoyer le nouvel email
        emailService.sendVerificationEmail(email, newCode);
        log.info("📧 Nouveau code de vérification envoyé à : {}", email);
    }

    /**
     * Générer un code de vérification aléatoire à 6 chiffres
     * @return Code à 6 chiffres sous forme de String
     */
    private String generateVerificationCode() {
        SecureRandom random = new SecureRandom();
        int code = 100000 + random.nextInt(900000); // Génère un nombre entre 100000 et 999999
        return String.valueOf(code);
    }
}