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
}