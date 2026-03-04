package com.example.orientus.controller;

import com.example.orientus.dto.RegisterRequest;
import com.example.orientus.entity.User;
import com.example.orientus.service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Controller pour gérer les admins (OWNER uniquement)
 */
@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    /**
     * GET /api/admin/list?ownerEmail=xxx
     * Liste de tous les admins (OWNER uniquement)
     */
    @GetMapping("/list")
    public ResponseEntity<?> getAllAdmins(@RequestParam String ownerEmail) {
        try {
            // Vérifier que c'est un OWNER
            if (!adminService.isOwner(ownerEmail)) {
                Map<String, Object> error = new HashMap<>();
                error.put("message", "Only OWNER can view admin list");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }

            // Récupérer tous les admins
            List<User> admins = adminService.getAllAdmins();

            // Formater la réponse (sans les mots de passe)
            List<Map<String, Object>> response = admins.stream().map(admin -> {
                Map<String, Object> adminData = new HashMap<>();
                adminData.put("id", admin.getId());
                adminData.put("email", admin.getEmail());
                adminData.put("firstName", admin.getFirstName());
                adminData.put("lastName", admin.getLastName());
                adminData.put("phone", admin.getPhone());
                adminData.put("nationality", admin.getNationality());
                adminData.put("role", admin.getRole().name());
                adminData.put("createdAt", admin.getCreatedAt());
                return adminData;
            }).collect(Collectors.toList());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    /**
     * POST /api/admin/create?ownerEmail=xxx
     * Créer un admin (OWNER uniquement)
     */
    @PostMapping("/create")
    public ResponseEntity<?> createAdmin(
            @RequestParam String ownerEmail,
            @Valid @RequestBody RegisterRequest request
    ) {
        try {
            // Créer l'admin
            User admin = adminService.createAdmin(ownerEmail, request);

            // Formater la réponse
            Map<String, Object> response = new HashMap<>();
            response.put("id", admin.getId());
            response.put("email", admin.getEmail());
            response.put("firstName", admin.getFirstName());
            response.put("lastName", admin.getLastName());
            response.put("phone", admin.getPhone());
            response.put("nationality", admin.getNationality());
            response.put("role", admin.getRole().name());
            response.put("message", "Admin created successfully");

            return ResponseEntity.status(HttpStatus.CREATED).body(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    /**
     * DELETE /api/admin/{adminId}?ownerEmail=xxx
     * Supprimer un admin (OWNER uniquement)
     */
    @DeleteMapping("/{adminId}")
    public ResponseEntity<?> deleteAdmin(
            @PathVariable Long adminId,
            @RequestParam String ownerEmail
    ) {
        try {
            // Supprimer l'admin
            adminService.deleteAdmin(ownerEmail, adminId);

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Admin deleted successfully");

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}