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
}