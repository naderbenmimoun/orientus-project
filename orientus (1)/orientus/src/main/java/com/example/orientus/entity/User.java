package com.example.orientus.entity;

import com.example.orientus.enums.UserRole;
import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    private String phone;

    @Column(nullable = false)
    private String nationality;  // ✅ On garde seulement la nationalité

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;  // ADMIN ou STUDENT
    //defalutb student

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}