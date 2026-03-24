package com.example.orientus.repository;

import com.example.orientus.entity.PartnerProgram;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PartnerProgramRepository extends JpaRepository<PartnerProgram, Long> {

    /**
     * Récupère la liste de tous les pays disponibles (unique)
     * Utilisé pour informer le LLM des pays disponibles
     */
    @Query("SELECT DISTINCT p.country FROM PartnerProgram p ORDER BY p.country")
    List<String> findDistinctCountries();

    /**
     * Recherche par pays (insensible à la casse)
     */
    List<PartnerProgram> findByCountryIgnoreCase(String country);

    /**
     * Recherche par mot-clé dans le nom du programme
     */
    @Query("SELECT p FROM PartnerProgram p WHERE LOWER(p.programName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<PartnerProgram> findByProgramKeyword(@Param("keyword") String keyword);

    /**
     * Recherche multicritères (pays, niveau, budget)
     * Retourne programmes correspondant aux critères extraits par le LLM
     */
    @Query("SELECT p FROM PartnerProgram p WHERE " +
            "(:country IS NULL OR LOWER(p.country) = LOWER(:country)) AND " +
            "(:level IS NULL OR LOWER(p.studyLevel) LIKE LOWER(CONCAT('%', :level, '%'))) AND " +
            "(:maxBudget IS NULL OR p.tuitionAmount IS NULL OR p.tuitionAmount <= :maxBudget)")
    List<PartnerProgram> searchByCriteria(
            @Param("country") String country,
            @Param("level") String level,
            @Param("maxBudget") Double maxBudget
    );

    // ═══════════════════════════════════════════════════════════════
    // Amélioration 9 : Recherche floue (fuzzy search)
    // ═══════════════════════════════════════════════════════════════

    /**
     * Recherche floue par pays (LIKE insensible à la casse)
     */
    @Query("SELECT p FROM PartnerProgram p WHERE LOWER(p.country) LIKE LOWER(CONCAT('%', :country, '%'))")
    List<PartnerProgram> fuzzySearchByCountry(@Param("country") String country);

    /**
     * Recherche floue par mot-clé dans le titre OU la description du programme
     */
    @Query("SELECT p FROM PartnerProgram p WHERE " +
            "LOWER(p.programName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(p.universityName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<PartnerProgram> fuzzySearchByKeyword(@Param("keyword") String keyword);

    // ═══════════════════════════════════════════════════════════════
    // Amélioration 4 : Requêtes pour le fallback intelligent
    // ═══════════════════════════════════════════════════════════════

    /**
     * Fallback : même pays, n'importe quel niveau
     */
    @Query("SELECT p FROM PartnerProgram p WHERE LOWER(p.country) = LOWER(:country)")
    List<PartnerProgram> findByCountryOnly(@Param("country") String country);

    /**
     * Fallback : même niveau, n'importe quel pays
     */
    @Query("SELECT p FROM PartnerProgram p WHERE LOWER(p.studyLevel) LIKE LOWER(CONCAT('%', :level, '%'))")
    List<PartnerProgram> findByLevelOnly(@Param("level") String level);

    /**
     * Fallback : recherche par mot-clé dans le programme (toutes localisations)
     */
    @Query("SELECT p FROM PartnerProgram p WHERE LOWER(p.programName) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<PartnerProgram> findByKeywordOnly(@Param("keyword") String keyword);

    /**
     * Récupérer tous les niveaux d'études distincts
     */
    @Query("SELECT DISTINCT p.studyLevel FROM PartnerProgram p WHERE p.studyLevel IS NOT NULL ORDER BY p.studyLevel")
    List<String> findDistinctStudyLevels();
}