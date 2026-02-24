package com.example.orientus.service;

import com.example.orientus.dto.RegisterRequest;
import com.example.orientus.entity.User;
import com.example.orientus.enums.UserRole;
import com.example.orientus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;

    // 📝 Inscription publique → Toujours STUDENT
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

    // 🔒 Création d'admin → Seulement par un admin (on verra plus tard avec Spring Security)
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

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}