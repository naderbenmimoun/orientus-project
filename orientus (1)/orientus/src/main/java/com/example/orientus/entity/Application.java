package com.example.orientus.entity;

import com.example.orientus.enums.ApplicationStatus;
import com.example.orientus.enums.BudgetRange;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relations
    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private User student;

    @ManyToOne
    @JoinColumn(name = "program_id", nullable = false)
    private Program program;

    // Informations de l'étudiant (depuis profile)
    @Column(nullable = false)
    private String studentFirstName;

    @Column(nullable = false)
    private String studentLastName;

    @Column(nullable = false)
    private String studentEmail;

    @Column(nullable = false)
    private String studentPhone;

    private String studentNationality;

    // Budget
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BudgetRange budgetRange;

    // Documents
    @Column(nullable = false)
    private Boolean hasPassport;

    @Column(nullable = false)
    private Boolean hasEnglishB2;

    @Column(nullable = false)
    private Boolean hasFrenchB2;

    // Notes supplémentaires
    @Column(length = 2000)
    private String additionalNotes;

    // Statut (géré par admin)
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ApplicationStatus status;

    // Timestamps
    @Column(nullable = false)
    private LocalDateTime applicationDate;

    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        applicationDate = LocalDateTime.now();
        status = ApplicationStatus.NON_REPONDU;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}