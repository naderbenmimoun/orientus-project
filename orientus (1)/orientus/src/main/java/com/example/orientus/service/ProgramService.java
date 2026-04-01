package com.example.orientus.service;

import com.example.orientus.entity.Program;
import com.example.orientus.enums.ProgramCategory;
import com.example.orientus.enums.ProgramDegree;
import com.example.orientus.repository.ProgramRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class ProgramService {

    private final ProgramRepository programRepository;

    // ==========================================
    // Méthodes existantes (inchangées)
    // ==========================================

    /**
     * Récupérer tous les programmes avec pagination
     */
    public Page<Program> getAllPrograms(Pageable pageable) {
        return programRepository.findAll(pageable);
    }

    /**
     * Récupérer un programme par ID
     */
    public Program getProgramById(Long id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Program not found with id: " + id));
    }

    /**
     * Créer un nouveau programme — invalide les caches
     */
    @CacheEvict(value = {"all-programs", "program-countries", "program-categories", "program-degrees", "program-languages", "program-filters"}, allEntries = true)
    public Program createProgram(Program program) {
        if (program.getTitle() == null || program.getTitle().trim().isEmpty()) {
            throw new RuntimeException("Program title is required");
        }
        log.info("✅ Programme créé, caches invalidés");
        return programRepository.save(program);
    }

    /**
     * Mettre à jour un programme — invalide les caches
     */
    @CacheEvict(value = {"all-programs", "program-countries", "program-categories", "program-degrees", "program-languages", "program-filters"}, allEntries = true)
    public Program updateProgram(Long id, Program programDetails) {
        Program program = getProgramById(id);

        program.setTitle(programDetails.getTitle());
        program.setUniversity(programDetails.getUniversity());
        program.setCountry(programDetails.getCountry());
        program.setCity(programDetails.getCity());
        program.setDegree(programDetails.getDegree());
        program.setCategory(programDetails.getCategory());
        program.setDuration(programDetails.getDuration());
        program.setLanguage(programDetails.getLanguage());
        program.setTuition(programDetails.getTuition());
        program.setDescription(programDetails.getDescription());
        program.setImage(programDetails.getImage());
        program.setUniversityLogo(programDetails.getUniversityLogo());
        program.setFeatured(programDetails.getFeatured());

        // === ML FIELDS ===
        program.setStudyMode(programDetails.getStudyMode());
        program.setMinGpa(programDetails.getMinGpa());
        program.setMinLanguageLevel(programDetails.getMinLanguageLevel());
        program.setMinIelts(programDetails.getMinIelts());
        program.setMinToefl(programDetails.getMinToefl());
        program.setScholarshipAvailable(programDetails.getScholarshipAvailable());

        log.info("✅ Programme {} mis à jour, caches invalidés", id);
        return programRepository.save(program);
    }

    /**
     * Supprimer un programme — invalide les caches
     */
    @CacheEvict(value = {"all-programs", "program-countries", "program-categories", "program-degrees", "program-languages", "program-filters"}, allEntries = true)
    public void deleteProgram(Long id) {
        Program program = getProgramById(id);
        programRepository.delete(program);
        log.info("✅ Programme {} supprimé, caches invalidés", id);
    }

    /**
     * Rechercher des programmes
     */
    public Page<Program> searchPrograms(String query, Pageable pageable) {
        return programRepository.searchPrograms(query, pageable);
    }

    /**
     * Filtrer par pays
     */
    public Page<Program> getProgramsByCountry(String country, Pageable pageable) {
        return programRepository.findByCountry(country, pageable);
    }

    /**
     * Filtrer par catégorie
     */
    public Page<Program> getProgramsByCategory(ProgramCategory category, Pageable pageable) {
        return programRepository.findByCategory(category, pageable);
    }

    /**
     * Filtrer par type de diplôme
     */
    public Page<Program> getProgramsByDegree(ProgramDegree degree, Pageable pageable) {
        return programRepository.findByDegree(degree, pageable);
    }

    /**
     * Programmes mis en avant (featured)
     */
    public Page<Program> getFeaturedPrograms(Pageable pageable) {
        return programRepository.findByFeaturedTrue(pageable);
    }

    /**
     * Compter les programmes par pays
     */
    public Long countProgramsByCountry(String country) {
        return programRepository.countByCountry(country);
    }

    /**
     * Compter les programmes par catégorie
     */
    public Long countProgramsByCategory(ProgramCategory category) {
        return programRepository.countByCategory(category);
    }

    /**
     * Compter les programmes par diplôme
     */
    public Long countProgramsByDegree(ProgramDegree degree) {
        return programRepository.countByDegree(degree);
    }

    // ==========================================
    // AMÉLIORATION 1 : Endpoint /all — Tout en 1 requête
    // Un seul appel findAll() + extraction des distinct values en Java
    // ==========================================

    /**
     * Retourne tous les programmes + metadata des filtres en une seule requête.
     * Utilisé par le frontend quand il y a < 200 programmes.
     * Caché pour éviter des requêtes répétitives.
     */
    @Cacheable("all-programs")
    @Transactional(readOnly = true)
    public Map<String, Object> getAllProgramsWithMetadata() {
        log.info("📦 Chargement de tous les programmes + metadata (cache miss)");
        List<Program> programs = programRepository.findAll();

        // Extraction des valeurs distinctes directement en Java (plus efficace qu'un second appel DB)
        Set<String> countries = new TreeSet<>();
        Set<String> categories = new TreeSet<>();
        Set<String> degrees = new TreeSet<>();
        Set<String> languages = new TreeSet<>();

        for (Program p : programs) {
            if (p.getCountry() != null) countries.add(p.getCountry());
            if (p.getCategory() != null) categories.add(p.getCategory().name());
            if (p.getDegree() != null) degrees.add(p.getDegree().name());
            if (p.getLanguage() != null && !p.getLanguage().isBlank()) languages.add(p.getLanguage());
        }

        Map<String, Object> filters = new LinkedHashMap<>();
        filters.put("countries", new ArrayList<>(countries));
        filters.put("categories", new ArrayList<>(categories));
        filters.put("degrees", new ArrayList<>(degrees));
        filters.put("languages", new ArrayList<>(languages));

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("programs", programs);
        response.put("filters", filters);
        response.put("totalPrograms", programs.size());

        return response;
    }

    // ==========================================
    // AMÉLIORATION 2 : Endpoint /filters — Metadata seule
    // Requêtes distinctes légères, sans charger les programmes
    // ==========================================

    /**
     * Retourne uniquement les metadata des filtres (pas les programmes).
     * Utilisé par le frontend quand il y a > 200 programmes.
     */
    @Cacheable("program-filters")
    @Transactional(readOnly = true)
    public Map<String, Object> getFilterMetadata() {
        log.info("🔍 Chargement des metadata filtres (cache miss)");

        Map<String, Object> filters = new LinkedHashMap<>();
        filters.put("countries", programRepository.findDistinctCountries());
        filters.put("categories", programRepository.findDistinctCategories().stream()
                .map(Enum::name).collect(Collectors.toList()));
        filters.put("degrees", programRepository.findDistinctDegrees().stream()
                .map(Enum::name).collect(Collectors.toList()));
        filters.put("languages", programRepository.findDistinctLanguages());
        filters.put("totalPrograms", programRepository.count());

        return filters;
    }

    // ==========================================
    // AMÉLIORATION 3 : Filtres combinés
    // Remplace les else if par une seule requête multi-filtres
    // ==========================================

    /**
     * Recherche avec tous les filtres combinés (search + country + category + degree + language).
     * Tous les paramètres sont optionnels. Si null → ignoré.
     */
    @Transactional(readOnly = true)
    public Page<Program> findWithFilters(String search, String country,
                                          ProgramCategory category, ProgramDegree degree,
                                          String language, Pageable pageable) {
        return programRepository.findWithFilters(search, country, category, degree, language, pageable);
    }

    // ==========================================
    // AMÉLIORATION 5 : Stats optimisées
    // Utilise count() au lieu de findAll().getTotalElements()
    // ==========================================

    /**
     * Statistiques optimisées — utilise COUNT SQL au lieu de charger tous les programmes en mémoire
     */
    @Transactional(readOnly = true)
    public Map<String, Object> getOptimizedStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalPrograms", programRepository.count());
        stats.put("countries", programRepository.findDistinctCountries().size());
        stats.put("categories", programRepository.findDistinctCategories().size());
        stats.put("degrees", programRepository.findDistinctDegrees().size());
        return stats;
    }
}