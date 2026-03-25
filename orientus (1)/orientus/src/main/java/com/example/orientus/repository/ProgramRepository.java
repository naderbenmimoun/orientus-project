package com.example.orientus.repository;

import com.example.orientus.entity.Program;
import com.example.orientus.enums.ProgramCategory;
import com.example.orientus.enums.ProgramDegree;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProgramRepository extends JpaRepository<Program, Long> {

    // ==========================================
    // Méthodes existantes (inchangées)
    // ==========================================

    // Recherche par pays
    Page<Program> findByCountry(String country, Pageable pageable);

    // Recherche par catégorie
    Page<Program> findByCategory(ProgramCategory category, Pageable pageable);

    // Recherche par type de diplôme
    Page<Program> findByDegree(ProgramDegree degree, Pageable pageable);

    // Recherche par pays et catégorie
    Page<Program> findByCountryAndCategory(String country, ProgramCategory category, Pageable pageable);

    // Recherche par ville
    Page<Program> findByCity(String city, Pageable pageable);

    // Programmes mis en avant (featured)
    Page<Program> findByFeaturedTrue(Pageable pageable);

    // Recherche globale (titre, université, pays, ville)
    @Query("SELECT p FROM Program p WHERE " +
            "LOWER(p.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.university) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.country) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(p.city) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Program> searchPrograms(@Param("query") String query, Pageable pageable);

    // Compter les programmes par pays
    Long countByCountry(String country);

    // Compter les programmes par catégorie
    Long countByCategory(ProgramCategory category);

    // Compter les programmes par diplôme
    Long countByDegree(ProgramDegree degree);

    // ==========================================
    // AMÉLIORATION 2 : Metadata pour les filtres
    // Requêtes distinctes pour alimenter /api/programs/filters
    // ==========================================

    @Query("SELECT DISTINCT p.country FROM Program p WHERE p.country IS NOT NULL ORDER BY p.country")
    List<String> findDistinctCountries();

    @Query("SELECT DISTINCT p.category FROM Program p WHERE p.category IS NOT NULL ORDER BY p.category")
    List<ProgramCategory> findDistinctCategories();

    @Query("SELECT DISTINCT p.degree FROM Program p WHERE p.degree IS NOT NULL ORDER BY p.degree")
    List<ProgramDegree> findDistinctDegrees();

    @Query("SELECT DISTINCT p.language FROM Program p WHERE p.language IS NOT NULL ORDER BY p.language")
    List<String> findDistinctLanguages();

    // ==========================================
    // AMÉLIORATION 3 : Filtres combinés
    // Une seule requête JPQL qui combine TOUS les filtres (remplace les else if)
    // ==========================================

    @Query("SELECT p FROM Program p WHERE " +
            "(:search IS NULL OR :search = '' OR " +
            "LOWER(p.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.university) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.country) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
            "LOWER(p.city) LIKE LOWER(CONCAT('%', :search, '%'))) AND " +
            "(:country IS NULL OR :country = '' OR p.country = :country) AND " +
            "(:category IS NULL OR p.category = :category) AND " +
            "(:degree IS NULL OR p.degree = :degree) AND " +
            "(:language IS NULL OR :language = '' OR p.language = :language)")
    Page<Program> findWithFilters(
            @Param("search") String search,
            @Param("country") String country,
            @Param("category") ProgramCategory category,
            @Param("degree") ProgramDegree degree,
            @Param("language") String language,
            Pageable pageable
    );
}