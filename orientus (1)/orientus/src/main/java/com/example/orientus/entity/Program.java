package com.example.orientus.entity;

import com.example.orientus.enums.ProgramCategory;
import com.example.orientus.enums.ProgramDegree;
import com.example.orientus.enums.StudyMode;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "programs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Program {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String university;

    @Column(nullable = false)
    private String country;

    @Column(nullable = false)
    private String city;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProgramDegree degree;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ProgramCategory category;

    private String duration;
    private String language;

    private Double tuition;

    @Column(length = 2000)
    private String description;

    @Column(columnDefinition = "TEXT")
    private String image; // Base64 ou URL de l'image

    @Column(columnDefinition = "TEXT")
    private String universityLogo; // Base64 ou URL du logo

    private Boolean featured; // Programme mis en avant (Promu)

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @Column
    private LocalDateTime updatedAt;

    // === ML FIELDS - Critères d'admission ===
    @Enumerated(EnumType.STRING)
    private StudyMode studyMode;

    private Double minGpa;

    private String minLanguageLevel;  // A1, A2, B1, B2, C1, C2

    private Double minIelts;

    private Integer minToefl;

    private Boolean scholarshipAvailable = false;

    // === Compteurs ML (pour V2 futur) ===
    private Integer viewCount = 0;
    private Integer clickCount = 0;
    private Integer applicationCount = 0;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (featured == null) {
            featured = false;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}