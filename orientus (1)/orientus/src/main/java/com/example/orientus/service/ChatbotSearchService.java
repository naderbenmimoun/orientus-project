package com.example.orientus.service;

import com.example.orientus.dto.SearchCriteria;
import com.example.orientus.entity.PartnerProgram;
import com.example.orientus.repository.PartnerProgramRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotSearchService {

    private final PartnerProgramRepository repository;

    /**
     * Rechercher programmes selon critères
     */
    public List<PartnerProgram> search(SearchCriteria criteria) {

        log.info("Searching with criteria: {}", criteria);

        List<PartnerProgram> results = repository.findAll();

        // Filtrer par pays
        if (criteria.getCountry() != null && !criteria.getCountry().isBlank()) {
            results = results.stream()
                    .filter(p -> p.getCountry() != null &&
                            p.getCountry().equalsIgnoreCase(criteria.getCountry()))
                    .collect(Collectors.toList());
        }

        // Filtrer par niveau
        if (criteria.getStudyLevel() != null && !criteria.getStudyLevel().isBlank()) {
            results = results.stream()
                    .filter(p -> p.getStudyLevel() != null &&
                            p.getStudyLevel().toLowerCase().contains(criteria.getStudyLevel().toLowerCase()))
                    .collect(Collectors.toList());
        }

        // Filtrer par mots-clés programme
        if (criteria.getProgramKeywords() != null && !criteria.getProgramKeywords().isEmpty()) {
            results = results.stream()
                    .filter(p -> matchesAnyKeyword(p.getProgramName(), criteria.getProgramKeywords()))
                    .collect(Collectors.toList());
        }

        // Filtrer par budget
        if (criteria.getMaxBudget() != null) {
            results = results.stream()
                    .filter(p -> p.getTuitionAmount() != null &&
                            p.getTuitionAmount() <= criteria.getMaxBudget())
                    .collect(Collectors.toList());
        }

        log.info("Found {} programs", results.size());

        // Limiter à 10 résultats
        return results.stream().limit(10).collect(Collectors.toList());
    }

    /**
     * Vérifier si le nom du programme contient un des mots-clés
     */
    private boolean matchesAnyKeyword(String programName, List<String> keywords) {
        if (programName == null || programName.isBlank()) return false;

        String program = programName.toLowerCase();
        return keywords.stream()
                .anyMatch(keyword -> program.contains(keyword.toLowerCase()));
    }
}