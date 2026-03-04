package com.example.orientus.service;

import com.example.orientus.dto.RegisterRequest;
import com.example.orientus.entity.User;
import com.example.orientus.enums.UserRole;
import com.example.orientus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AdminService {

    private final UserRepository userRepository;

    /**
     * Créer un admin (OWNER uniquement)
     * @param ownerEmail Email de l'utilisateur OWNER qui crée l'admin
     * @param request Données du nouvel admin
     * @return Le nouvel admin créé
     */
    public User createAdmin(String ownerEmail, RegisterRequest request) {
        // 1. Vérifier que l'utilisateur qui fait la requête est un OWNER
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (owner.getRole() != UserRole.OWNER) {
            throw new RuntimeException("Only OWNER can create admins");
        }

        // 2. Vérifier si l'email existe déjà
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already exists");
        }

        // 3. Créer le nouvel admin
        User admin = new User();
        admin.setEmail(request.getEmail());
        admin.setPassword(request.getPassword()); // TODO: Hash avec BCrypt
        admin.setFirstName(request.getFirstName());
        admin.setLastName(request.getLastName());
        admin.setPhone(request.getPhone());
        admin.setNationality(request.getNationality());
        admin.setRole(UserRole.ADMIN);
        admin.setCreatedAt(LocalDateTime.now());

        return userRepository.save(admin);
    }

    /**
     * Supprimer un admin (OWNER uniquement)
     * @param ownerEmail Email de l'utilisateur OWNER qui supprime l'admin
     * @param adminId ID de l'admin à supprimer
     */
    public void deleteAdmin(String ownerEmail, Long adminId) {
        // 1. Vérifier que l'utilisateur qui fait la requête est un OWNER
        User owner = userRepository.findByEmail(ownerEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (owner.getRole() != UserRole.OWNER) {
            throw new RuntimeException("Only OWNER can delete admins");
        }

        // 2. Récupérer l'admin à supprimer
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));

        // 3. Vérifier que c'est bien un ADMIN (pas un OWNER ou STUDENT)
        if (admin.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("Can only delete ADMIN users");
        }

        // 4. Supprimer l'admin
        userRepository.delete(admin);
    }

    /**
     * Liste de tous les admins
     * @return Liste des utilisateurs ayant le rôle ADMIN
     */
    public List<User> getAllAdmins() {
        return userRepository.findByRole(UserRole.ADMIN);
    }

    /**
     * Vérifier si un utilisateur est OWNER
     * @param email Email de l'utilisateur à vérifier
     * @return true si l'utilisateur est OWNER, false sinon
     */
    public boolean isOwner(String email) {
        return userRepository.findByEmail(email)
                .map(user -> user.getRole() == UserRole.OWNER)
                .orElse(false);
    }
}