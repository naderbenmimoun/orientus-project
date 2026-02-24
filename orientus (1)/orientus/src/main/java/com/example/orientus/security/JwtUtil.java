package com.example.orientus.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

/**
 * Utilitaire pour générer et valider les JWT tokens
 */
@Component
public class JwtUtil {

    // 🔑 CLÉ SECRÈTE pour signer les JWT
    // ⚠️ En production, mettre cette clé dans application.properties
    private final String SECRET_KEY = "orientus_secret_key_2026_very_long_and_secure_key_for_jwt_authentication_system";

    // ⏰ DURÉE DE VALIDITÉ du token : 24 heures (en millisecondes)
    private final long EXPIRATION_TIME = 86400000; // 24h = 24 * 60 * 60 * 1000


    /**
     * Générer la clé secrète à partir du String
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }


    /**
     * Générer un JWT token pour un utilisateur
     * @param email Email de l'utilisateur
     * @param role Rôle de l'utilisateur (ADMIN ou STUDENT)
     * @return Le JWT token
     */
    public String generateToken(String email, String role) {

        // 📝 Créer les claims (données) du token
        Map<String, Object> claims = new HashMap<>();
        claims.put("email", email);
        claims.put("role", role);

        // 🎫 Générer le token avec la nouvelle API
        return Jwts.builder()
                .claims(claims)                                      // Données (email, role)
                .subject(email)                                      // Sujet = email
                .issuedAt(new Date())                                // Date de création
                .expiration(new Date(System.currentTimeMillis() + EXPIRATION_TIME)) // Expiration
                .signWith(getSigningKey())                           // Signature avec la clé secrète
                .compact();                                          // Générer la chaîne JWT
    }


    /**
     * Valider un JWT token
     * @param token Le JWT token
     * @return true si valide, false sinon
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())  // Vérifier la signature
                    .build()
                    .parseSignedClaims(token);    // Parser le token
            return true;                       // Token valide
        } catch (Exception e) {
            return false;                      // Token invalide ou expiré
        }
    }


    /**
     * Extraire l'email du JWT token
     * @param token Le JWT token
     * @return L'email
     */
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }


    /**
     * Extraire le rôle du JWT token
     * @param token Le JWT token
     * @return Le rôle (ADMIN ou STUDENT)
     */
    public String extractRole(String token) {
        return (String) extractAllClaims(token).get("role");
    }


    /**
     * Extraire toutes les données (claims) du JWT token
     * @param token Le JWT token
     * @return Les claims
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}