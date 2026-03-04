package com.example.orientus.controller;

import com.example.orientus.dto.UpdateProfileRequest;
import com.example.orientus.entity.User;
import com.example.orientus.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

/**
 * Controller pour gérer le profil utilisateur
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;


    /**
     * GET /api/users/profile?email=xxx
     * Récupérer le profil de l'utilisateur connecté
     */
    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(@RequestParam String email) {
        try {
            // Récupérer l'utilisateur
            User user = userService.getUserByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Créer la réponse (sans le mot de passe)
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("email", user.getEmail());
            response.put("firstName", user.getFirstName());
            response.put("lastName", user.getLastName());
            response.put("phone", user.getPhone());
            response.put("nationality", user.getNationality());
            response.put("role", user.getRole().name());
            response.put("createdAt", user.getCreatedAt());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }


    /**
     * PUT /api/users/profile?email=xxx
     * Mettre à jour le profil de l'utilisateur connecté
     */
    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestParam String email,
            @Valid @RequestBody UpdateProfileRequest request
    ) {
        try {
            // Mettre à jour l'utilisateur
            User updatedUser = userService.updateProfile(email, request);

            // Créer la réponse (sans le mot de passe)
            Map<String, Object> response = new HashMap<>();
            response.put("id", updatedUser.getId());
            response.put("email", updatedUser.getEmail());
            response.put("firstName", updatedUser.getFirstName());
            response.put("lastName", updatedUser.getLastName());
            response.put("phone", updatedUser.getPhone());
            response.put("nationality", updatedUser.getNationality());
            response.put("role", updatedUser.getRole().name());
            response.put("message", "Profile updated successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }


    /**
     * DELETE /api/users/profile?email=xxx
     * Supprimer le compte de l'utilisateur connecté
     */
    @DeleteMapping("/profile")
    public ResponseEntity<?> deleteAccount(@RequestParam String email) {
        try {
            // Supprimer l'utilisateur
            userService.deleteUser(email);

            // Créer la réponse
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Account deleted successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}