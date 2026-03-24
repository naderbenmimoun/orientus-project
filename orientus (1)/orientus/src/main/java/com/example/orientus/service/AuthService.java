package com.example.orientus.service;

import com.example.orientus.dto.LoginRequest;
import com.example.orientus.entity.User;
import com.example.orientus.repository.UserRepository;
import com.example.orientus.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Service pour l'authentification (login)
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;


    /**
     * Connexion d'un utilisateur
     * @param request Email et mot de passe
     * @return Le JWT token
     */
    public String login(LoginRequest request) {

        // 🔍 ÉTAPE 1 : Vérifier si l'utilisateur existe
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        // ⬆️ Si l'utilisateur n'existe pas → erreur
        //    On ne dit PAS "email incorrect" pour des raisons de sécurité
        //    (un attaquant ne doit pas savoir si l'email existe)


        // 🔒 ÉTAPE 2 : Vérifier le mot de passe
        if (!user.getPassword().equals(request.getPassword())) {
            // ⬆️ Comparaison simple (en clair)
            //    Plus tard avec BCrypt : passwordEncoder.matches(request.getPassword(), user.getPassword())

            throw new RuntimeException("Invalid email or password");
        }

        // 📧 ÉTAPE 2.5 : Vérifier si l'email est vérifié
        if (!user.isVerified()) {
            throw new RuntimeException("Email not verified. Please check your inbox and verify your email before logging in.");
        }


        // 🎫 ÉTAPE 3 : Générer un JWT token
        return jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        // ⬆️ Génère un token contenant l'email et le rôle
    }


    /**
     * Récupérer un utilisateur par email
     * @param email Email de l'utilisateur
     * @return L'utilisateur
     */
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}