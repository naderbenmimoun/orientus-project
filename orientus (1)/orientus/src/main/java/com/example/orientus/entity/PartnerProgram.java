package com.example.orientus.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Entity représentant un programme d'université partenaire
 * Cette table est utilisée UNIQUEMENT par le chatbot
 * Les données proviennent de l'import Excel automatique
 */
@Entity
@Table(name = "partner_programs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PartnerProgram {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Pays où se situe l'université
     * Récupéré depuis le nom du sheet Excel
     * Exemple: "France", "Spain", "Turkey"
     */
    @Column(nullable = false)
    private String country;

    /**
     * Nom de l'université
     * Colonne Excel: "University Name" / "Universities" / "University"
     * Exemple: "Bahcesehir Istanbul University"
     */
    @Column(nullable = false)
    private String universityName;

    /**
     * Nom du programme d'études
     * Colonne Excel: "Program Name" / "Program"
     * Exemple: "Master in Artificial Intelligence"
     */
    @Column(nullable = false)
    private String programName;

    /**
     * Niveau d'études
     * Colonne Excel: "Degree Type" / "Level"
     * Valeurs possibles: "Bachelor", "Master", "PhD", "MBA"
     */
    private String studyLevel;

    /**
     * Frais de scolarité (format texte original)
     * Conserve le format exact du fichier Excel
     * Exemple: "3 836 €", "$18,375", "5000-9000 EUR"
     */
    private String tuitionFeesRaw;

    /**
     * Montant des frais (valeur numérique)
     * Extrait et parsé depuis tuitionFeesRaw
     * Exemple: 3836.0, 18375.0
     */
    private Double tuitionAmount;

    /**
     * Devise des frais
     * Extrait depuis tuitionFeesRaw
     * Valeurs: "EUR", "USD", "GBP"
     */
    private String tuitionCurrency;

    /**
     * Périodes d'admission
     * Colonne Excel: "Intakes" / "Intake"
     * Exemple: "Fall intake", "September", "February and September"
     */
    private String intakes;

    /**
     * Langue d'enseignement
     * Colonne Excel: "Language"
     * Exemple: "English", "French", "German"
     */
    private String language;

    /**
     * Ville ou mode d'enseignement
     * Colonne Excel: "City"
     * Exemple: "Istanbul", "Madrid", "Online"
     */
    private String city;

    /**
     * Durée des études
     * Colonne Excel: "Duration" / "Study Period"
     * Exemple: "48 Months", "2 years", "3 years"
     */
    private String duration;

    /**
     * URL du site web de l'université
     * Colonne Excel: "Website" / "Website URL"
     * Optionnel
     */
    private String websiteUrl;

    /**
     * Nom du sheet Excel d'origine
     * Utilisé pour traçabilité et debug
     * Exemple: "Turkey", "France"
     */
    private String sourceSheet;

    /**
     * Date et heure de l'import en base de données
     * Rempli automatiquement lors de la création
     */
    @Column(nullable = false)
    private LocalDateTime importedAt;

    /**
     * Hook JPA: Exécuté automatiquement avant INSERT
     * Initialise la date d'import
     */
    @PrePersist
    protected void onCreate() {
        importedAt = LocalDateTime.now();
    }
}