package com.example.orientus.service;

import com.example.orientus.dto.SearchCriteria;
import com.example.orientus.dto.SearchStats;
import com.example.orientus.entity.PartnerProgram;
import com.example.orientus.repository.PartnerProgramRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Service de recherche pour le chatbot
 * Amélioré avec :
 * - Amélioration 4 : Fallback intelligent (alternatives quand 0 résultat)
 * - Amélioration 9 : Recherche floue (fuzzy search)
 * - Amélioration 10 : Statistiques sur les résultats
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class ChatbotSearchService {

    private final PartnerProgramRepository repository;

    /** Nombre maximum de résultats retournés */
    private static final int MAX_RESULTS = 10;

    /** Nombre maximum d'alternatives en fallback */
    private static final int MAX_ALTERNATIVES = 5;

    /**
     * Rechercher programmes selon critères (amélioré avec recherche floue)
     */
    public List<PartnerProgram> search(SearchCriteria criteria) {

        log.info("🔍 Recherche avec critères : {}", criteria);

        // Amélioration 9 : Utiliser la recherche floue via repository
        List<PartnerProgram> results = repository.findAll();

        // Filtrer par pays (recherche floue)
        if (criteria.getCountry() != null && !criteria.getCountry().isBlank()) {
            List<PartnerProgram> fuzzyByCountry = repository.fuzzySearchByCountry(criteria.getCountry());
            if (!fuzzyByCountry.isEmpty()) {
                results = fuzzyByCountry;
            } else {
                // Fallback : filtre en mémoire insensible à la casse
                results = results.stream()
                        .filter(p -> p.getCountry() != null &&
                                p.getCountry().toLowerCase().contains(criteria.getCountry().toLowerCase()))
                        .collect(Collectors.toList());
            }
        }

        // Filtrer par niveau d'études
        if (criteria.getStudyLevel() != null && !criteria.getStudyLevel().isBlank()) {
            results = results.stream()
                    .filter(p -> p.getStudyLevel() != null &&
                            p.getStudyLevel().toLowerCase().contains(criteria.getStudyLevel().toLowerCase()))
                    .collect(Collectors.toList());
        }

        // Filtrer par mots-clés programme (recherche floue)
        if (criteria.getProgramKeywords() != null && !criteria.getProgramKeywords().isEmpty()) {
            results = results.stream()
                    .filter(p -> matchesAnyKeyword(p, criteria.getProgramKeywords()))
                    .collect(Collectors.toList());
        }

        // Filtrer par budget
        if (criteria.getMaxBudget() != null) {
            results = results.stream()
                    .filter(p -> p.getTuitionAmount() != null &&
                            p.getTuitionAmount() <= criteria.getMaxBudget())
                    .collect(Collectors.toList());
        }

        log.info("✅ {} programmes trouvés", results.size());

        // Limiter à MAX_RESULTS résultats
        return results.stream().limit(MAX_RESULTS).collect(Collectors.toList());
    }

    /**
     * Amélioration 4 : Rechercher des alternatives quand 0 résultat
     * Relâche progressivement les critères :
     * 1. Même pays, autre niveau
     * 2. Même niveau, autre pays
     * 3. Mêmes mots-clés partout
     */
    public List<PartnerProgram> findAlternatives(SearchCriteria criteria) {

        log.info("🔄 Recherche d'alternatives pour : {}", criteria);
        Set<Long> seenIds = new HashSet<>();
        List<PartnerProgram> alternatives = new ArrayList<>();

        // Stratégie 1 : Même pays, n'importe quel niveau
        if (criteria.getCountry() != null && !criteria.getCountry().isBlank()) {
            List<PartnerProgram> sameCountry = repository.findByCountryOnly(criteria.getCountry());
            for (PartnerProgram p : sameCountry) {
                if (seenIds.add(p.getId()) && alternatives.size() < MAX_ALTERNATIVES) {
                    alternatives.add(p);
                }
            }
            log.info("   Stratégie 1 (même pays) : {} alternatives", alternatives.size());
        }

        // Stratégie 2 : Même niveau, n'importe quel pays
        if (alternatives.size() < MAX_ALTERNATIVES && criteria.getStudyLevel() != null && !criteria.getStudyLevel().isBlank()) {
            List<PartnerProgram> sameLevel = repository.findByLevelOnly(criteria.getStudyLevel());
            for (PartnerProgram p : sameLevel) {
                if (seenIds.add(p.getId()) && alternatives.size() < MAX_ALTERNATIVES) {
                    alternatives.add(p);
                }
            }
            log.info("   Stratégie 2 (même niveau) : {} alternatives au total", alternatives.size());
        }

        // Stratégie 3 : Mêmes mots-clés, partout
        if (alternatives.size() < MAX_ALTERNATIVES && criteria.getProgramKeywords() != null && !criteria.getProgramKeywords().isEmpty()) {
            for (String keyword : criteria.getProgramKeywords()) {
                List<PartnerProgram> byKeyword = repository.findByKeywordOnly(keyword);
                for (PartnerProgram p : byKeyword) {
                    if (seenIds.add(p.getId()) && alternatives.size() < MAX_ALTERNATIVES) {
                        alternatives.add(p);
                    }
                }
            }
            log.info("   Stratégie 3 (mots-clés) : {} alternatives au total", alternatives.size());
        }

        log.info("🔄 {} alternatives trouvées au total", alternatives.size());
        return alternatives;
    }

    /**
     * Amélioration 10 : Calculer les statistiques sur les résultats
     */
    public SearchStats computeStats(List<PartnerProgram> results) {
        if (results == null || results.isEmpty()) {
            return SearchStats.builder()
                    .totalResults(0)
                    .build();
        }

        // Calculer min/max frais de scolarité
        Double minTuition = results.stream()
                .map(PartnerProgram::getTuitionAmount)
                .filter(Objects::nonNull)
                .min(Double::compare)
                .orElse(null);

        Double maxTuition = results.stream()
                .map(PartnerProgram::getTuitionAmount)
                .filter(Objects::nonNull)
                .max(Double::compare)
                .orElse(null);

        // Collecter les niveaux d'études distincts
        List<String> availableDegrees = results.stream()
                .map(PartnerProgram::getStudyLevel)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        // Collecter les pays distincts
        List<String> availableCountries = results.stream()
                .map(PartnerProgram::getCountry)
                .filter(Objects::nonNull)
                .distinct()
                .sorted()
                .collect(Collectors.toList());

        return SearchStats.builder()
                .totalResults(results.size())
                .minTuition(minTuition)
                .maxTuition(maxTuition)
                .availableDegrees(availableDegrees)
                .availableCountries(availableCountries)
                .build();
    }

    /**
     * Amélioration 9 : Vérifier si le programme correspond à un des mots-clés
     * Recherche dans le nom du programme ET le nom de l'université
     */
    private boolean matchesAnyKeyword(PartnerProgram program, List<String> keywords) {
        String programName = program.getProgramName() != null ? program.getProgramName().toLowerCase() : "";
        String universityName = program.getUniversityName() != null ? program.getUniversityName().toLowerCase() : "";
        String combined = programName + " " + universityName;

        return keywords.stream()
                .anyMatch(keyword -> combined.contains(keyword.toLowerCase()));
    }
}