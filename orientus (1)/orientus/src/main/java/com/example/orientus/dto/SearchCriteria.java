package com.example.orientus.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.List;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class SearchCriteria {

    /**
     * true = question liée aux études
     * false = question hors-sujet
     */
    private Boolean inDomain;

    /**
     * Pays recherché
     * Exemple: "France", "Spain", "Turkey"
     */
    private String country;

    /**
     * Niveau d'études
     * Exemple: "Bachelor", "Master", "PhD", "MBA"
     */
    private String studyLevel;

    /**
     * Mots-clés du domaine d'études
     * Exemple: ["AI", "computer science", "artificial intelligence"]
     */
    private List<String> programKeywords;

    /**
     * Budget maximum en euros
     * Exemple: 10000.0
     */
    private Double maxBudget;
}