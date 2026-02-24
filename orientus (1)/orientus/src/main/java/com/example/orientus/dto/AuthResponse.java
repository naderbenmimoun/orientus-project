package com.example.orientus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO pour la réponse après inscription ou connexion
 * Contient les informations de l'utilisateur (sans mot de passe)
 */
@Data  // Génère getters/setters
@AllArgsConstructor  // Génère un constructeur avec tous les paramètres
@NoArgsConstructor   // Génère un constructeur vide
public class AuthResponse {

    // 🆔 ID de l'utilisateur
    private Long id;

    // 📧 Email
    private String email;

    // 👤 Prénom
    private String firstName;

    // 👤 Nom
    private String lastName;

    // 🎭 Rôle (ADMIN ou STUDENT)
    private String role;

    // 💬 Message de confirmation ou d'erreur
    private String message;

    // ⚠️ PAS de champ "password" !
    // Sécurité : Ne JAMAIS exposer le mot de passe
}