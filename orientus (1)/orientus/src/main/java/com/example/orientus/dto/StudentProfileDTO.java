package com.example.orientus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileDTO {
    private String interestField;          // ex: "COMPUTER_SCIENCE"
    private String preferredCountry;       // ex: "France" ou "ANY"
    private String preferredLanguage;      // ex: "English" ou "ANY"
    private String targetDegree;           // ex: "MASTER"
    private String currentDegree;          // ex: "BACHELOR"
    private Double gpa;                    // ex: 14.5 (nullable)
    private String languageLevel;          // ex: "B2"
    private Double ieltsScore;             // ex: 6.5 (nullable)
    private Double maxBudget;              // ex: 8000.0
    private String studyMode;              // ex: "ON_CAMPUS"
    private Boolean needsScholarship;      // ex: false
}

