package com.example.orientus.controller;

import com.example.orientus.dto.*;
import com.example.orientus.entity.User;
import com.example.orientus.service.AuthService;
import com.example.orientus.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controller pour l'authentification
 * Gère l'inscription, la connexion, la vérification d'email et la création d'admin
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final UserService userService;
    private final AuthService authService;


    /**
     * 📝 Endpoint d'inscription publique (rôle STUDENT automatique)
     * POST /api/auth/register
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = userService.registerStudent(request);

            AuthResponse response = new AuthResponse(
                    user.getId(),
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getRole().name(),
                    "Student registered successfully. Please check your email for the verification code."
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            AuthResponse errorResponse = new AuthResponse(
                    null, null, null, null, null, e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }


    /**
     * 🔑 Endpoint de connexion (LOGIN)
     * POST /api/auth/login
     */
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            // 🎫 ÉTAPE 1 : Authentifier et générer le JWT token
            String token = authService.login(request);

            // 👤 ÉTAPE 2 : Récupérer les infos de l'utilisateur
            User user = authService.getUserByEmail(request.getEmail());

            // 📦 ÉTAPE 3 : Créer la réponse avec le token et les infos user
            LoginResponse response = new LoginResponse(
                    token,                      // JWT token
                    user.getId(),
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getRole().name(),
                    "Login successful"
            );

            // ✅ ÉTAPE 4 : Retourner HTTP 200 OK
            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            // ❌ En cas d'erreur (email ou mot de passe incorrect)

            LoginResponse errorResponse = new LoginResponse(
                    null, null, null, null, null, null, e.getMessage()
            );

            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorResponse);
        }
    }


    /**
     * 🔒 Endpoint de création d'admin (réservé aux admins)
     * POST /api/auth/admin/create
     * TODO: Sera protégé plus tard avec JWT
     */
    @PostMapping("/admin/create")
    public ResponseEntity<AuthResponse> createAdmin(@Valid @RequestBody RegisterRequest request) {
        try {
            User user = userService.createAdmin(request);

            AuthResponse response = new AuthResponse(
                    user.getId(),
                    user.getEmail(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getRole().name(),
                    "Admin created successfully"
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            AuthResponse errorResponse = new AuthResponse(
                    null, null, null, null, null, e.getMessage()
            );
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(errorResponse);
        }
    }


    /**
     * 📧 Endpoint de vérification d'email
     * POST /api/auth/verify
     */
    @PostMapping("/verify")
    public ResponseEntity<Map<String, String>> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        try {
            userService.verifyEmail(request.getEmail(), request.getCode());
            return ResponseEntity.ok(Map.of("message", "Email verified successfully. You can now log in."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * 🔄 Endpoint pour renvoyer un code de vérification
     * POST /api/auth/resend-code
     */
    @PostMapping("/resend-code")
    public ResponseEntity<Map<String, String>> resendVerificationCode(@Valid @RequestBody ResendCodeRequest request) {
        try {
            userService.resendVerificationCode(request.getEmail());
            return ResponseEntity.ok(Map.of("message", "A new verification code has been sent to your email."));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", e.getMessage()));
        }
    }


    /**
     * ✅ Endpoint de test
     * GET /api/auth/test
     */
    @GetMapping("/test")
    public ResponseEntity<String> test() {
        return ResponseEntity.ok("API is working!");
    }
}